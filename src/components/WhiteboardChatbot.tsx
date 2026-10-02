"use client";

import React, { useState, useRef, useEffect } from "react";
import { CornerDownLeft } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "hey! leave a note on the board or ask me anything about what i'm building.",
  },
];

interface WhiteboardChatbotProps {
  className?: string;
  isMobile?: boolean;
  onUserSend?: () => void;
  onBotWritingStart?: () => void;
  onBotWritingEnd?: () => void;
}

export default function WhiteboardChatbot({
  className = "",
  isMobile = false,
  onUserSend,
  onBotWritingStart,
  onBotWritingEnd,
}: WhiteboardChatbotProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (typeof textToSend === "string" ? textToSend : inputValue).trim();
    if (!text || isTyping) return;

    onUserSend?.();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    const botMsgId = `bot-${Date.now()}`;
    const botPlaceholder: Message = {
      id: botMsgId,
      sender: "bot",
      text: "",
    };

    // Optimistically update message history
    const historyPayload = [...messages, userMsg];
    setMessages([...historyPayload, botPlaceholder]);
    if (typeof textToSend !== "string") setInputValue("");
    setIsTyping(true);
    onBotWritingStart?.();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulated } : m))
        );
      }

      if (!accumulated.trim()) {
        const fallbackText =
          "got your note! drop your email or hit me up at rishiicreates@gmail.com.";
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, text: fallbackText } : m))
        );
      }
    } catch (err) {
      console.error("Failed to stream chat response:", err);
      const fallbackMsg =
        "got your note! leave your contact info or email me directly at rishiicreates@gmail.com.";
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, text: fallbackMsg } : m))
      );
    } finally {
      setIsTyping(false);
      onBotWritingEnd?.();
    }
  };

  return (
    <div
      className={`size-full flex flex-col bg-transparent text-[#14191f] select-text ${
        isMobile ? "px-4 py-3" : "px-7 py-5"
      } ${className}`}
      style={{
        fontFamily: "'Patrick Hand', 'Architects Daughter', 'Kalam', cursive, sans-serif",
      }}
    >
      {/* 1. Messages Flow Written Directly on the Whiteboard Surface */}
      <div
        className={`flex-1 overflow-y-auto py-2 space-y-4 min-h-0 whiteboard-scrollbar pr-3 ${
          isMobile ? "text-[18px] leading-snug" : "text-[30px] leading-[1.32]"
        }`}
      >
        {messages.map((m) => {
          if (!m.text && m.sender === "bot" && isTyping && m.id === messages[messages.length - 1].id) {
            return null; // hide empty bot placeholder until first token arrives
          }
          return (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="max-w-[96%] text-left">
                {m.sender === "bot" ? (
                  <div className="space-y-1">
                    <p className="marker-ink-black whitespace-pre-wrap font-semibold tracking-wide">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="marker-ink-blue whitespace-pre-wrap font-bold tracking-wide">
                      {m.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div
            className={`flex items-center gap-1.5 text-[#0e5c63] font-marker italic py-0.5 ${
              isMobile ? "text-base" : "text-[24px]"
            }`}
          >
            <span>writing</span>
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
              .
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. Whiteboard Marker Input Line at Bottom (Right above 3D marker tray) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 pt-2.5 border-t-2 border-[#14191f]/25 flex items-center gap-3"
      >
        <span
          className={
            isMobile
              ? "text-base text-[#14191f]/50 select-none"
              : "text-2xl text-[#14191f]/50 select-none"
          }
        >
          ✎
        </span>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="write on board & press Enter..."
          className={`flex-1 bg-transparent border-b-2 border-[#14191f]/35 focus:border-[#0e5c63] text-[#14191f] placeholder:text-[#14191f]/35 focus:outline-none transition-colors font-marker ${
            isMobile ? "text-[17px] py-1" : "text-[26px] py-1"
          }`}
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={`shrink-0 rounded-md border-2 border-[#14191f]/40 hover:border-[#0e5c63] hover:text-[#0e5c63] hover:bg-[#0e5c63]/10 font-marker text-[#14191f] disabled:opacity-25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
            isMobile
              ? "text-sm px-3 py-1"
              : "text-[22px] px-4 py-1 font-bold"
          }`}
          aria-label="Write on board"
        >
          <span>write</span>
          <CornerDownLeft className={isMobile ? "size-3.5" : "size-5"} />
        </button>
      </form>
    </div>
  );
}
