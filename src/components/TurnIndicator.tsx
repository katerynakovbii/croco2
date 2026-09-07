interface Props {
  phase: "waiting" | "playing" | "ended";
  isMyTurn: boolean;
  paused: boolean;
}

export function TurnIndicator({ phase, isMyTurn, paused }: Props) {
  if (phase === "waiting") {
    return (
      <div className="text-center font-medium text-lg animate-pulse" style={{ color: "var(--croc-deep)" }}>
        Waiting for partner to join...
      </div>
    );
  }

  if (paused) {
    return (
      <div className="text-center font-medium text-lg animate-pulse" style={{ color: "var(--claw-edge)" }}>
        Partner disconnected — waiting for them to return...
      </div>
    );
  }

  if (phase === "ended") return null;

  return (
    <div
      className="text-center font-bold text-xl px-6 py-2 rounded-full border-2"
      style={
        isMyTurn
          ? { background: "var(--turn-on)", color: "#fff", borderColor: "var(--turn-on-deep)" }
          : { background: "var(--card)", color: "var(--ink-soft)", borderColor: "var(--card-edge)" }
      }
    >
      {isMyTurn ? "Your turn — press a tooth!" : "Partner's turn..."}
    </div>
  );
}
