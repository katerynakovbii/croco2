"use client";

interface Props {
  loser: string | null;
  yourId: string | null;
  playAgainVotes: string[];
  onPlayAgain: () => void;
}

export function GameOverOverlay({ loser, yourId, playAgainVotes, onPlayAgain }: Props) {
  const iLost = loser === yourId;
  const iVoted = yourId !== null && playAgainVotes.includes(yourId);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="rounded-3xl shadow-2xl p-8 mx-4 text-center max-w-sm w-full" style={{ background: "var(--card)" }}>
        <div className="text-6xl mb-3">{iLost ? "😬" : "🎉"}</div>
        <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--ink)" }}>
          {iLost ? "Ouch!" : "Safe!"}
        </h2>
        <p className="mb-6 text-lg" style={{ color: "var(--ink-soft)" }}>
          {iLost ? "The croc got your finger!" : "Your partner woke the croc!"}
        </p>

        <button
          onClick={onPlayAgain}
          disabled={iVoted}
          className="w-full font-bold text-lg py-3 rounded-2xl transition-colors mb-3 disabled:opacity-50"
          style={{ background: "var(--croc)", color: "#fff" }}
        >
          {iVoted ? "Waiting for partner..." : "Play Again"}
        </button>

        {playAgainVotes.length === 1 && (
          <p className="text-sm animate-pulse" style={{ color: "var(--croc-deep)" }}>
            1 / 2 ready — waiting for your partner
          </p>
        )}
      </div>
    </div>
  );
}
