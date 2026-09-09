"use client";

import { useEffect, useRef, useState } from "react";
import { PRESET_EMOJIS, type ChatMessage } from "@/types/game";

interface Props {
  messages: ChatMessage[];
  yourId: string | null;
  onSendChat: (text: string) => void;
  onSendEmoji: (emoji: string) => void;
}

export function ChatPanel({ messages, yourId, onSendChat, onSendEmoji }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendChat(trimmed);
    setText("");
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden border"
      style={{ background: "var(--card)", borderColor: "var(--card-edge)" }}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-sm text-center mt-4" style={{ color: "var(--ink-soft)" }}>
            No messages yet
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.from === yourId;
          return (
            <div key={`${msg.from}-${msg.ts}-${i}`} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${msg.emoji ? "text-2xl px-1" : ""}`}
                style={
                  msg.emoji
                    ? {}
                    : isMe
                    ? { background: "var(--croc)", color: "#fff", borderBottomRightRadius: 4 }
                    : { background: "var(--sand-deep)", color: "var(--ink)", borderBottomLeftRadius: 4 }
                }
              >
                {msg.emoji ?? msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-1 px-3 py-2 border-t overflow-x-auto" style={{ borderColor: "var(--card-edge)" }}>
        {PRESET_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendEmoji(emoji)}
            className="text-xl hover:scale-125 transition-transform flex-shrink-0"
            aria-label={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex gap-2 p-3 border-t" style={{ borderColor: "var(--card-edge)" }}>
        <input
          type="text"
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Say something..."
          className="flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none"
          style={{ borderColor: "var(--card-edge)", color: "var(--ink)" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="font-semibold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-40"
          style={{ background: "var(--croc)", color: "#fff" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
