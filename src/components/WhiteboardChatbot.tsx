"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Mail, Sparkles, Check, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "Hey there! I'm Rishii's AI assistant. I can answer questions about his robotics automation work, full-stack systems, or take a message for him directly.",
    time: "Just now",
  },
];

const SUGGESTED_PROMPTS = [
  "What is Mind Robotics?",
  "Tell me about Rishii",
  "Skills & Tech Stack",
  "Available for hire?",
];

function getBotReply(input: string): { text: string; action?: { label: string; url?: string } } {
  const query = input.toLowerCase().trim();

  if (query.includes("who is rishii") || query.includes("about") || query.includes("tell me about")) {
    return {
      text: "Rishii (Hrishikesh Yadav) is a full-stack engineer and AI systems builder based in Delhi NCR, India. He builds autonomous robotics systems, intelligent factory floors, and high-performance 3D spatial web applications using Next.js, Three.js, and Python.",
      action: {
        label: "View Work & Projects →",
        url: "/work",
      },
    };
  }

  if (query.includes("mind robotics") || query.includes("what is mind")) {
    return {
      text: "Mind Robotics is an engineering initiative bridging physical factory floor operations with real-time AI automation, interactive 3D digital twins, and autonomous telemetry loops.",
      action: {
        label: "Explore Interactive Factory →",
        url: "/#factory",
      },
    };
  }

  if (query.includes("skill") || query.includes("stack") || query.includes("tech") || query.includes("tools")) {
    return {
      text: "Core stack: TypeScript, React, Next.js, Three.js / WebGL, Tailwind CSS, Python, PyTorch, Docker, MCP (Model Context Protocol), Node.js, and autonomous agent architectures.",
    };
  }

  if (query.includes("hire") || query.includes("available") || query.includes("contract") || query.includes("freelance")) {
    return {
      text: "Yes! Rishii is available for high-impact engineering roles, AI system contracts, and robotics consulting. You can reach out directly via email at rishiicreates@gmail.com.",
      action: {
        label: "Email rishiicreates@gmail.com",
        url: "mailto:rishiicreates@gmail.com",
      },
    };
  }

  if (query.includes("contact") || query.includes("email") || query.includes("message") || query.includes("reach") || query.includes("@")) {
    return {
      text: "You can reach Rishii directly at rishiicreates@gmail.com or connect via GitHub (@rishiicreates) and LinkedIn. Feel free to leave your note here and I'll make sure it's queued!",
      action: {
        label: "Send via Email App 📬",
        url: `mailto:rishiicreates@gmail.com?subject=Note from Portfolio Whiteboard&body=${encodeURIComponent(input)}`,
      },
    };
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return {
      text: "Hello! Welcome to the lab. Feel free to ask about Rishii's projects, technology stack, or discuss collaborating on something exciting.",
    };
  }

  return {
    text: `Got your message: "${input}". Rishii reviews all inquiries on engineering and AI collaboration. Drop your email or write directly to rishiicreates@gmail.com!`,
    action: {
      label: "Compose Email to Rishii →",
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
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
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
    }, 450);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    setIsTyping(false);
  };

  const handleCopyNote = () => {
    const chatTranscript = messages
      .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join("\n\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(chatTranscript).catch(() => {});
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  return (
    <div
      className={`size-full flex flex-col bg-[#fdfdfc]/95 text-[#061a1e] rounded-xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(6,26,30,0.08),0_12px_36px_rgba(6,26,30,0.08)] backdrop-blur-xs select-text ${className}`}
      style={{
        fontFamily: "inherit",
      }}
    >
      {/* 1. Whiteboard Top Status Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 bg-[#f4f2ee] border-b border-[#061a1e]/[0.08]">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#299093] animate-pulse" />
          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#061a1e]/80">
            Mind AI // Whiteboard
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyNote}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-[#061a1e]/60 hover:text-[#061a1e] hover:bg-[#061a1e]/5 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy conversation"
          >
            {copiedNote ? (
              <>
                <Check className="size-3 text-[#299093]" />
                <span>Copied</span>
              </>
            ) : (
              <span>Copy</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded text-[#061a1e]/60 hover:text-[#061a1e] hover:bg-[#061a1e]/5 transition-colors cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>

      {/* 2. Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2.5 space-y-2.5 min-h-0 text-xs sm:text-[13px] leading-relaxed custom-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-3 py-2 text-left transition-all ${
                m.sender === "user"
                  ? "bg-[#061a1e] text-white rounded-br-xs shadow-sm"
                  : "bg-white text-[#061a1e] rounded-bl-xs border border-[#061a1e]/[0.08] shadow-[0_2px_8px_rgba(6,26,30,0.04)]"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Bot Action link chip if present */}
              {m.action && (
                <div className="mt-2 pt-2 border-t border-[#061a1e]/[0.08]">
                  <a
                    href={m.action.url || "#"}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#299093] hover:text-[#061a1e] transition-colors"
                  >
                    <span>{m.action.label}</span>
                    <ArrowRight className="size-3" />
                  </a>
                </div>
              )}
            </div>
            <span className="text-[9px] font-mono text-[#061a1e]/40 mt-0.5 px-1">
              {m.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#061a1e]/[0.08] w-fit">
            <span className="size-1.5 rounded-full bg-[#299093] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="size-1.5 rounded-full bg-[#299093] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="size-1.5 rounded-full bg-[#299093] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Starter Prompt Chips */}
      {messages.length <= 2 && (
        <div className="shrink-0 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-[#061a1e]/[0.05] bg-[#fdfdfc]/80">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-2 py-0.5 rounded-full bg-white hover:bg-[#299093] hover:text-white border border-[#061a1e]/[0.1] text-[10px] sm:text-[11px] font-medium text-[#061a1e]/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* 4. Input Bar at Bottom (Resting right on the marker tray) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="shrink-0 p-2 sm:p-2.5 bg-[#f6f4f0] border-t border-[#061a1e]/[0.08] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question or leave a note..."
          className="flex-1 bg-white border border-[#061a1e]/[0.12] rounded-full px-3 py-1.5 text-xs text-[#061a1e] placeholder:text-[#061a1e]/40 focus:outline-none focus:border-[#299093] focus:ring-1 focus:ring-[#299093] transition-all shadow-2xs"
        />

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="size-7 sm:size-8 rounded-full bg-[#061a1e] disabled:opacity-40 hover:bg-[#299093] text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xs"
          aria-label="Send message"
        >
          <Send className="size-3 sm:size-3.5" />
        </button>
      </form>
    </div>
  );
}
