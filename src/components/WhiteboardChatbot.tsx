"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, Check, ArrowRight, CornerDownLeft } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  action?: {
    label: string;
    url?: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "Hey! I'm Rishii's AI assistant on the whiteboard. Ask me about his robotics systems, full-stack architectures, or leave a note for him directly.",
    time: "now",
  },
];

const SUGGESTED_PROMPTS = [
  "What is Mind Robotics?",
  "Tell me about Rishii",
  "Skills & Tech",
  "Available to hire?",
];

function getBotReply(input: string): { text: string; action?: { label: string; url?: string } } {
  const query = input.toLowerCase().trim();

  if (query.includes("who is rishii") || query.includes("about") || query.includes("tell me about")) {
    return {
      text: "Rishii (Hrishikesh Yadav) is an engineer and AI systems builder based in Delhi NCR, India. He builds autonomous robotics pipelines, factory floor intelligence, and 3D spatial web applications with Next.js, Three.js, and Python.",
      action: {
        label: "View Work & Projects →",
        url: "/work",
      },
    };
  }

  if (query.includes("mind robotics") || query.includes("what is mind")) {
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
      text: "Yes! Rishii is available for high-impact engineering roles, AI system contracts, and robotics consulting. You can email him directly at rishiicreates@gmail.com.",
      action: {
        label: "Email: rishiicreates@gmail.com ✉",
        url: "mailto:rishiicreates@gmail.com",
      },
    };
  }

  if (query.includes("contact") || query.includes("email") || query.includes("message") || query.includes("reach") || query.includes("@")) {
    return {
      text: "Direct email: rishiicreates@gmail.com | GitHub: @rishiicreates | LinkedIn: in/rishiicreates. Leave your note here and I'll make sure Rishii sees it!",
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
    text: `Got your note: "${input}". Rishii reviews all project inquiries and collaboration ideas. Drop your email or write to rishiicreates@gmail.com!`,
    action: {
      label: "Send via Email →",
      url: `mailto:rishiicreates@gmail.com?subject=Inquiry from Portfolio&body=${encodeURIComponent(input)}`,
    },
  };
}

export default function WhiteboardChatbot({
  className = "",
}: {
  className?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
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
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        action: reply.action,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    setIsTyping(false);
  };

  const handleCopyNote = () => {
    const transcript = messages
      .map((m) => `${m.sender === "bot" ? "AI" : "YOU"}: ${m.text}`)
      .join("\n\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(transcript).catch(() => {});
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  return (
    <div
      className={`size-full flex flex-col bg-transparent text-[#14191f] select-text px-2 py-1.5 sm:px-3 sm:py-2 ${className}`}
      style={{
        fontFamily: "'Patrick Hand', 'Architects Daughter', 'Kalam', cursive, sans-serif",
      }}
    >
      {/* 1. Whiteboard Top Marker Header Line */}
      <div className="shrink-0 flex items-center justify-between pb-1.5 border-b border-[#14191f]/25">
        <div className="flex items-center gap-1.5">
          <span className="text-[#0e5c63] text-sm sm:text-base font-bold animate-pulse">●</span>
          <span className="font-marker-title text-[13px] sm:text-[15px] font-bold tracking-wide text-[#14191f]/90">
            // MIND ROBOTICS — AI WHITEBOARD
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-marker">
          <button
            type="button"
            onClick={handleCopyNote}
            className="px-2 py-0.5 rounded border border-[#14191f]/30 hover:border-[#14191f] hover:bg-[#14191f]/5 transition-all flex items-center gap-1 cursor-pointer"
            title="Copy notes"
          >
            {copiedNote ? (
              <>
                <Check className="size-3 text-[#0e5c63]" />
                <span className="text-[#0e5c63]">copied</span>
              </>
            ) : (
              <span>copy</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-0.5 rounded border border-[#14191f]/30 hover:border-[#14191f] hover:bg-[#14191f]/5 transition-all flex items-center gap-1 cursor-pointer"
            title="Erase whiteboard"
          >
            <RotateCcw className="size-3" />
            <span>wipe</span>
          </button>
        </div>
      </div>

      {/* 2. Messages Written Directly on the Board */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2.5 min-h-0 text-[15px] sm:text-[16px] leading-[1.35] custom-scrollbar pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div className="max-w-[94%] text-left">
              {m.sender === "bot" ? (
                <div className="space-y-1">
                  <p className="marker-ink-black whitespace-pre-wrap">
                    <span className="text-[#0e5c63] font-bold mr-1">AI ➔</span>
                    {m.text}
                  </p>

                  {m.action && (
                    <div className="pl-5 pt-0.5">
                      <a
                        href={m.action.url || "#"}
                        className="inline-flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-[#0e5c63] hover:text-[#14191f] underline decoration-wavy decoration-[#0e5c63]/40 transition-colors"
                      >
                        <span>[ {m.action.label} ]</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-right">
                  <p className="marker-ink-blue whitespace-pre-wrap font-semibold">
                    <span className="text-[#1a4474] mr-1">You ➔</span>
                    &ldquo;{m.text}&rdquo;
                  </p>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#14191f]/35 font-mono mt-0.5 px-0.5">
              {m.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#0e5c63] font-marker italic py-1">
            <span>✎ scribbling on board</span>
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Starter Prompt Notes (Hand-drawn boxed notes) */}
      {messages.length <= 2 && (
        <div className="shrink-0 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-[#14191f]/15">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-2 py-0.5 rounded border border-[#14191f]/35 hover:border-[#0e5c63] hover:text-[#0e5c63] hover:bg-[#0e5c63]/5 text-xs sm:text-[13px] font-marker text-[#14191f]/85 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              [ {prompt} ]
            </button>
          ))}
        </div>
      )}

      {/* 4. Whiteboard Marker Input Line at Bottom (Right above 3D marker tray) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 pt-1.5 border-t border-[#14191f]/25 flex items-center gap-2"
      >
        <span className="text-sm sm:text-base text-[#14191f]/60 select-none">✎</span>

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
          placeholder="Write on board & press Enter..."
          className="flex-1 bg-transparent border-b-2 border-[#14191f]/40 focus:border-[#0e5c63] text-sm sm:text-base text-[#14191f] placeholder:text-[#14191f]/40 focus:outline-none transition-colors font-marker py-0.5"
        />

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="shrink-0 px-2.5 py-0.5 rounded border border-[#14191f]/40 hover:border-[#0e5c63] hover:bg-[#0e5c63]/10 text-xs sm:text-sm font-marker text-[#14191f] disabled:opacity-30 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
          aria-label="Write on board"
        >
          <span>Write</span>
          <CornerDownLeft className="size-3" />
        </button>
      </form>
    </div>
  );
}
