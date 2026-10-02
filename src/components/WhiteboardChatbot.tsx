"use client";

import React, { useState, useRef, useEffect } from "react";
import { CornerDownLeft } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  action?: {
    label: string;
    url?: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "Hey! Ask me about Rishii's robotics systems, full-stack architectures, or leave a note for him directly.",
  },
];

function getBotReply(input: string): { text: string; action?: { label: string; url?: string } } {
  const query = input.toLowerCase().trim();

  if (query.includes("who is rishii") || query.includes("about") || query.includes("rishii")) {
    return {
      text: "Rishii (Hrishikesh Yadav) is an engineer and AI systems builder based in Delhi NCR, India. He builds autonomous robotics pipelines, factory floor intelligence, and 3D spatial web applications with Next.js, Three.js, and Python.",
      action: {
        label: "View Work & Projects →",
        url: "/work",
      },
    };
  }

  if (query.includes("mind robotics") || query.includes("what is mind") || query.includes("robotics")) {
    return {
      text: "Mind Robotics bridges physical industrial hardware with real-time AI automation, interactive 3D digital twins, and autonomous telemetry loops.",
      action: {
        label: "Explore Factory Floor →",
        url: "/#factory",
      },
    };
  }

  if (query.includes("skill") || query.includes("stack") || query.includes("tech") || query.includes("tools")) {
    return {
      text: "Core Stack: TypeScript, React, Next.js, Three.js / WebGL, Tailwind, Python, PyTorch, Docker, MCP (Model Context Protocol), Node.js, and agentic workflows.",
    };
  }

  if (query.includes("hire") || query.includes("available") || query.includes("contract") || query.includes("freelance")) {
    return {
      text: "Yes! Rishii is available for high-impact engineering roles, AI system contracts, and robotics consulting. Email him directly at rishiicreates@gmail.com.",
      action: {
        label: "Email: rishiicreates@gmail.com ✉",
        url: "mailto:rishiicreates@gmail.com",
      },
    };
  }

  if (query.includes("contact") || query.includes("email") || query.includes("message") || query.includes("reach") || query.includes("@")) {
    return {
      text: "Direct email: rishiicreates@gmail.com | GitHub: @rishiicreates | LinkedIn: in/rishiicreates. Leave your note here and Rishii will review it directly!",
      action: {
        label: "Send Email Draft 📬",
        url: `mailto:rishiicreates@gmail.com?subject=Note from Portfolio Whiteboard&body=${encodeURIComponent(input)}`,
      },
    };
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return {
      text: "Hey! Welcome to the lab. Feel free to jot down any question about Rishii's projects, tech stack, or engineering collaboration.",
    };
  }

  return {
    text: `Got your note: "${input}". Rishii reviews all project inquiries and collaboration ideas. Drop your email or write directly to rishiicreates@gmail.com!`,
    action: {
      label: "Send via Email →",
      url: `mailto:rishiicreates@gmail.com?subject=Inquiry from Portfolio&body=${encodeURIComponent(input)}`,
    },
  };
}

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

  const handleSend = (textToSend?: string) => {
    const text = (typeof textToSend === "string" ? textToSend : inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (typeof textToSend !== "string") setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply.text,
        action: reply.action,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 350);
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

                  {m.action && (
                    <div className="pt-1.5">
                      <a
                        href={m.action.url || "#"}
                        className={`inline-flex items-center gap-1 font-bold text-[#0e5c63] hover:text-[#14191f] underline decoration-wavy decoration-[#0e5c63]/40 transition-colors ${
                          isMobile ? "text-[17px]" : "text-[28px]"
                        }`}
                      >
                        <span>[ {m.action.label} ]</span>
                      </a>
                    </div>
                  )}
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
            <span>scribbling</span>
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
          disabled={!inputValue.trim()}
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
