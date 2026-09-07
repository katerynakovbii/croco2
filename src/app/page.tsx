"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const createGame = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    router.push(`/game?room=${roomId}`);
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-6"
      style={{ background: "var(--sand)" }}
    >
      <div className="text-center">
        <div className="text-7xl mb-4">🐊</div>
        <h1 className="display text-3xl font-bold mb-2" style={{ color: "var(--croc-deep)" }}>
          Croco 2.0
        </h1>
        <p className="text-base" style={{ color: "var(--ink-soft)" }}>
          Take turns pressing teeth. Don&apos;t wake the croc!
        </p>
      </div>

      <button
        onClick={createGame}
        className="font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition-colors"
        style={{ background: "var(--croc)", color: "#fff" }}
      >
        Create Game
      </button>

      <p className="text-sm text-center max-w-xs" style={{ color: "var(--ink-soft)" }}>
        After creating, share the link with your partner. First to 2 players starts automatically.
      </p>
    </main>
  );
}
