"use client";

import usePartySocket from "partysocket/react";
import { useState, useEffect } from "react";
import type { ClientGameState, ServerMessage } from "@/types/game";

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

export function useGameRoom(roomId: string) {
  const [yourId, setYourId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [snapped, setSnapped] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const configError = !PARTYKIT_HOST;

  useEffect(() => {
    if (gameState?.phase === "playing" && snapped) {
      setSnapped(false);
    }
  }, [gameState?.phase, snapped]);

  const socket = usePartySocket({
    host: PARTYKIT_HOST ?? "",
    room: roomId,
    startClosed: configError,
    onMessage(event: MessageEvent) {
      const msg = JSON.parse(event.data as string) as ServerMessage;
      switch (msg.type) {
        case "joined":
          setYourId(msg.yourId);
          break;
        case "state":
          setGameState(msg.state);
          setSnapped(msg.state.phase === "ended");
          break;
        case "snap":
          setSnapped(true);
          break;
        case "roomFull":
          setRoomFull(true);
          break;
        case "partnerLeft":
        case "partnerRejoined":
          break;
      }
    },
  });

  const send = (msg: object) => socket.send(JSON.stringify(msg));

  return {
    yourId,
    gameState,
    snapped,
    roomFull,
    configError,
    pressTooth: (toothIndex: number) => send({ type: "press", toothIndex }),
    sendChat: (text: string) => send({ type: "chat", text }),
    sendEmoji: (emoji: string) => send({ type: "emoji", emoji }),
    playAgain: () => send({ type: "playAgain" }),
  };
}
