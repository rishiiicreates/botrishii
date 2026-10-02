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
}

export default function WhiteboardChatbot({
  className = "",
  isMobile = false,
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

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    // Optimistically append user message
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (typeof textToSend !== "string") setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "got your note! drop your email or hit me up at rishiicreates@gmail.com.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Failed to fetch chat response:", err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: "got your note! leave your contact info or email me directly at rishiicreates@gmail.com.",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
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
        className={`flex-1 overflow-y-auto py-2 space-y-5 min-h-0 whiteboard-scrollbar pr-3 ${
          isMobile ? "text-[19px] leading-snug" : "text-[35px] leading-[1.30]"
        }`}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="max-w-[96%] text-left">
              {m.sender === "bot" ? (
                <div className="space-y-2">
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
        ))}

        {isTyping && (
          <div
            className={`flex items-center gap-1.5 text-[#0e5c63] font-marker italic py-1 ${
              isMobile ? "text-base" : "text-[28px]"
            }`}
          >
            <span>writing</span>
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
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
        className="shrink-0 pt-3 border-t-2 border-[#14191f]/25 flex items-center gap-3"
      >
        <span
          className={
            isMobile
              ? "text-base text-[#14191f]/50 select-none"
              : "text-3xl text-[#14191f]/50 select-none"
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
            isMobile ? "text-[18px] py-1" : "text-[28px] py-1.5"
          }`}
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={`shrink-0 rounded-md border-2 border-[#14191f]/40 hover:border-[#0e5c63] hover:text-[#0e5c63] hover:bg-[#0e5c63]/10 font-marker text-[#14191f] disabled:opacity-25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
            isMobile
              ? "text-sm px-3 py-1"
              : "text-[24px] px-4 py-1.5 font-bold"
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
