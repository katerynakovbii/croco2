"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGameRoom } from "@/hooks/useGameRoom";
import { CrocodileSVG } from "@/components/CrocodileSVG";
import { TurnIndicator } from "@/components/TurnIndicator";
import { ChatPanel } from "@/components/ChatPanel";
import { GameOverOverlay } from "@/components/GameOverOverlay";
import { useEffect, useState } from "react";

// keep in sync with CrocodileSVG's jaw-close transition duration
const SNAP_ANIMATION_MS = 420;

function GameRoom() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room") ?? "";
  const [chatOpen, setChatOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const copyInviteLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const { yourId, gameState, snapped, roomFull, configError, pressTooth, sendChat, sendEmoji, playAgain } =
    useGameRoom(roomId);

  useEffect(() => {
    if (gameState?.phase !== "ended") {
      setShowOverlay(false);
      return;
    }
    const timer = setTimeout(() => setShowOverlay(true), SNAP_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [gameState?.phase]);

  if (configError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--sand)" }}>
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🐊</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            Server not configured
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>
            This deployment is missing its game-server address. Set{" "}
            <code>NEXT_PUBLIC_PARTYKIT_HOST</code> and redeploy.
          </p>
        </div>
      </main>
    );
  }

  if (!roomId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--sand)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🐊</div>
          <p style={{ color: "var(--ink-soft)" }}>
            No room ID.{" "}
            <Link href="/" className="underline" style={{ color: "var(--croc-deep)" }}>
              Go home
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (roomFull) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8" style={{ background: "var(--sand)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🐊</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>
            Game is full
          </h1>
          <p style={{ color: "var(--ink-soft)" }}>This game already has 2 players. Ask for a new link!</p>
        </div>
      </main>
    );
  }

  const isMyTurn = gameState?.currentTurn === yourId;
  const inviteUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--sand)" }}>
      <div className="flex items-center justify-between px-4 py-3 text-sm font-bold" style={{ color: "var(--ink-soft)" }}>
        <span>
          🐊 Croco 2.0 <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>· {roomId}</span>
        </span>
        <button
          onClick={() => copyInviteLink(inviteUrl)}
          className="text-xs border rounded-full px-3 py-1.5 transition-colors"
          style={
            linkCopied
              ? { borderColor: "var(--turn-on-deep)", color: "#fff", background: "var(--turn-on)" }
              : { borderColor: "var(--card-edge)", color: "var(--croc-deep)", background: "var(--card)" }
          }
          aria-live="polite"
        >
          {linkCopied ? "✅ Copied!" : "🔗 Copy invite link"}
        </button>
      </div>

      {gameState && (
        <div className="px-4 mb-2">
          <TurnIndicator phase={gameState.phase} isMyTurn={isMyTurn} paused={gameState.paused} />
        </div>
      )}

      <div className="relative flex-1 flex items-center justify-center px-2 min-h-[280px]">
        {gameState && (
          <CrocodileSVG
            pressedTeeth={gameState.pressedTeeth}
            isMyTurn={isMyTurn}
            phase={gameState.phase}
            snapped={snapped}
            paused={gameState.paused}
            onPressTooth={pressTooth}
          />
        )}
        {!gameState && (
          <p className="animate-pulse" style={{ color: "var(--croc-light)" }}>
            Connecting...
          </p>
        )}
        {showOverlay && (
          <GameOverOverlay
            loser={gameState.loser}
            yourId={yourId}
            playAgainVotes={gameState.playAgainVotes}
            onPlayAgain={playAgain}
          />
        )}
      </div>

      <div className="flex justify-center gap-2 px-4 py-3">
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="text-xs font-bold px-4 py-2 rounded-full border"
          style={{ borderColor: "var(--card-edge)", color: "var(--ink-soft)", background: "var(--card)" }}
        >
          💬 Chat
        </button>
      </div>

      {chatOpen && (
        <div className="px-4 pb-4 h-64">
          <ChatPanel messages={gameState?.chat ?? []} yourId={yourId} onSendChat={sendChat} onSendEmoji={sendEmoji} />
        </div>
      )}
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--sand)" }}>
          <p className="animate-pulse" style={{ color: "var(--croc-light)" }}>
            Loading...
          </p>
        </main>
      }
    >
      <GameRoom />
    </Suspense>
  );
}
