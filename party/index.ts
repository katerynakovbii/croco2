import { routePartykitRequest, Server, type Connection } from "partyserver";
import {
  createInitialState,
  addPlayer,
  handlePress,
  handlePlayAgain,
  addChatMessage,
  toClientState,
  type RoomState,
} from "./game-logic";
import { PRESET_EMOJIS, type ClientMessage, type ServerMessage } from "../src/types/game";

type Env = { Main: DurableObjectNamespace<GameRoom> };

// Hibernation stays off (the default): room state and reconnect timers live in memory.
export class GameRoom extends Server<Env> {
  private state: RoomState = createInitialState();
  private disconnectedPlayerIds = new Set<string>();
  private reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

  onConnect(conn: Connection) {
    const joinedMsg: ServerMessage = { type: "joined", yourId: conn.id };
    conn.send(JSON.stringify(joinedMsg));

    if (this.disconnectedPlayerIds.size > 0) {
      const oldId = this.disconnectedPlayerIds.values().next().value!;
      this.disconnectedPlayerIds.delete(oldId);
      const timer = this.reconnectTimers.get(oldId);
      if (timer) {
        clearTimeout(timer);
        this.reconnectTimers.delete(oldId);
      }
      this.state = {
        ...this.state,
        players: this.state.players.map((p) => (p === oldId ? conn.id : p)),
        currentTurn: this.state.currentTurn === oldId ? conn.id : this.state.currentTurn,
        loser: this.state.loser === oldId ? conn.id : this.state.loser,
        playAgainVotes: this.state.playAgainVotes.map((p) => (p === oldId ? conn.id : p)),
        paused: this.disconnectedPlayerIds.size > 0,
      };
      this.send({ type: "partnerRejoined" });
      this.broadcastState();
      return;
    }

    const result = addPlayer(this.state, conn.id);
    if (result === "full") {
      const fullMsg: ServerMessage = { type: "roomFull" };
      conn.send(JSON.stringify(fullMsg));
      conn.close();
      return;
    }

    this.state = result;
    this.broadcastState();
  }

  onMessage(sender: Connection, message: string | ArrayBuffer | ArrayBufferView) {
    if (typeof message !== "string") return;
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case "press": {
        const result = handlePress(this.state, sender.id, msg.toothIndex);
        if (typeof result === "string") return;
        const wasPlaying = this.state.phase === "playing";
        this.state = result;
        if (wasPlaying && this.state.phase === "ended") {
          this.send({ type: "snap", loser: this.state.loser! });
        }
        this.broadcastState();
        break;
      }
      case "chat": {
        if (typeof msg.text !== "string") return;
        const text = msg.text.trim().slice(0, 200);
        if (!text) return;
        this.state = addChatMessage(this.state, sender.id, Date.now(), text, undefined);
        this.broadcastState();
        break;
      }
      case "emoji": {
        if (!(PRESET_EMOJIS as readonly string[]).includes(msg.emoji)) return;
        this.state = addChatMessage(this.state, sender.id, Date.now(), undefined, msg.emoji);
        this.broadcastState();
        break;
      }
      case "playAgain": {
        this.state = handlePlayAgain(this.state, sender.id);
        this.broadcastState();
        break;
      }
    }
  }

  onClose(conn: Connection) {
    if (!this.state.players.includes(conn.id)) return;

    this.disconnectedPlayerIds.add(conn.id);
    this.state = { ...this.state, paused: true };
    this.send({ type: "partnerLeft" });

    const timer = setTimeout(() => {
      this.reconnectTimers.delete(conn.id);
      if (!this.disconnectedPlayerIds.has(conn.id)) return; // already reconnected

      for (const t of this.reconnectTimers.values()) clearTimeout(t);
      this.reconnectTimers.clear();
      this.disconnectedPlayerIds.clear();

      const stillConnected = [...this.getConnections()].map((c) => c.id);
      let fresh = createInitialState();
      for (const id of stillConnected) {
        const result = addPlayer(fresh, id);
        if (result !== "full") fresh = result;
      }
      this.state = fresh;
      this.broadcastState();
    }, 60_000);
    this.reconnectTimers.set(conn.id, timer);
  }

  private broadcastState() {
    this.send({ type: "state", state: toClientState(this.state) });
  }

  // Named `send` because `Server` already defines `broadcast(msg: string)`.
  private send(msg: ServerMessage) {
    this.broadcast(JSON.stringify(msg));
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
