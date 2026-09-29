"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DavidInteractiveExperience3D from "@/components/DavidInteractiveExperience3D";
import {
  Volume2,
  VolumeX,
  MapPin,
  GraduationCap,
  Code2,
  Award,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  link: string;
  renderBanner: () => React.ReactNode;
}

export default function UnifiedPortfolioPage() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"hero" | "about" | "projects">("hero");

  // Continuous 3D scroll progress & opacity states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [aboutOpacity, setAboutOpacity] = useState(0);

  // Synchronize scroll position with continuous 3D WebGL timeline
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // 0 to 850px: Continuous 3D animation (sitting mannequin -> standing hologram on pedestal)
      const transitionDistance = 850;
      const progress = Math.max(0, Math.min(1, scrollY / transitionDistance));
      setScrollProgress(progress);

      // Hero editorial text fades out smoothly between 0 and 220px
      const hOpacity = Math.max(0, Math.min(1, 1 - scrollY / 220));
      setHeroOpacity(hOpacity);

      // About HUD cards fade in between 450px and 850px, stay fully visible, then fade out past 1950px
      let aOpacity = 0;
      if (scrollY >= 450 && scrollY < 1950) {
        aOpacity = Math.max(0, Math.min(1, (scrollY - 450) / 350));
      } else if (scrollY >= 1950) {
        aOpacity = Math.max(0, Math.min(1, 1 - (scrollY - 1950) / 200));
      }
      setAboutOpacity(aOpacity);

      // Navigation state & theme tracking
      if (scrollY >= 1950) {
        setActiveSection("projects");
      } else if (scrollY >= 450) {
        setActiveSection("about");
      } else {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const playSound = (sound: "click" | "hover") => {
    if (!audioEnabled) return;
    try {
      const audio = new Audio(`/audio/${sound}.ogg`);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch {}
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("rishiicreates@gmail.com");
    setShowCopied(true);
    playSound("click");
    setTimeout(() => setShowCopied(false), 2200);
  };

  const scrollToAbout = () => {
    playSound("click");
    window.scrollTo({ top: 1100, behavior: "smooth" });
  };

  const scrollToProjects = () => {
    playSound("click");
    const el = document.getElementById("projects");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    playSound("click");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const PROJECTS: ProjectItem[] = [
    {
      id: "shiro-rag",
      title: "Shiro",
      category: "Multiplayer strategy & RAG system",
      description: "3-tier enterprise RAG system over 95k+ chunks",
      tags: ["Spring Boot", "FastAPI", "ChromaDB", "Gemini SSE", "Docker"],
      link: "https://github.com/rishiiicreates/shiro-academic-ai",
      renderBanner: () => (
        <div className="relative w-full h-full bg-gradient-to-br from-[#ff9f43] via-[#ff6b6b] to-[#a55eea] flex items-center justify-center overflow-hidden p-6">
          <div className="absolute -top-8 -left-8 size-28 bg-[#feca57] rounded-3xl rotate-12 opacity-80 shadow-md" />
          <div className="absolute -bottom-10 right-10 size-32 bg-[#5f27cd] rounded-3xl -rotate-12 opacity-70 shadow-lg" />
          <div className="absolute top-1/2 -right-8 size-20 bg-[#ff9ff3] rounded-2xl rotate-45 opacity-60" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/95 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-white transform -rotate-2 group-hover:scale-105 group-hover:rotate-0 transition-transform duration-300">
              <span className="size-4 rounded-full bg-[#fa8207]" />
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1b1b1b] font-sans">
                SHIRO RAG
              </span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-wider uppercase">
              95K+ VECTORS • SUB-200MS
            </span>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#fa8207] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#e67503] transition-all duration-300 z-20">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </div>
      ),
    },
    {
      id: "rawfy-mcp",
      title: "Rawfy",
      category: "Agent perception infrastructure",
      description: "Web perception layer & MCP server for AI agents",
      tags: ["TypeScript", "Playwright", "MCP Server", "REST API", "Open Source"],
      link: "https://github.com/rishiiicreates",
      renderBanner: () => (
        <div className="relative w-full h-full bg-[#0066ff] flex items-center justify-center overflow-hidden p-6">
          <div className="absolute size-80 rounded-full border border-white/20 animate-ping opacity-20" />
          <div className="absolute size-56 rounded-full border border-white/25" />
          <div className="absolute size-36 rounded-full border border-white/30" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <div className="size-14 sm:size-16 rounded-2xl bg-white flex items-center justify-center text-[#0066ff] font-black text-2xl sm:text-3xl shadow-xl">
                <span>o+</span>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Rawfy
              </span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-wider uppercase">
              AGENT PERCEPTION • PLAYWRIGHT MCP
            </span>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#fa8207] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#e67503] transition-all duration-300 z-20">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </div>
      ),
    },
    {
      id: "email-triage-agent",
      title: "Email Triage Agent",
      category: "Autonomous benchmarking environment",
      description: "OpenEnv-compliant multi-step reasoning environment",
      tags: ["Python", "FastAPI", "Docker", "Hugging Face", "Qwen 2.5"],
      link: "https://github.com/rishiiicreates",
      renderBanner: () => (
        <div className="relative w-full h-full bg-gradient-to-b from-[#1b88e8] via-[#1070c7] to-[#044c92] flex items-center justify-center overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 bg-white/95 px-5 py-2.5 rounded-2xl shadow-xl border-2 border-white transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-2xl">🤖</span>
              <span className="text-2xl sm:text-3xl font-black text-[#044c92] tracking-tight">
                TriageEnv
              </span>
            </div>
            <div className="mt-3 px-4 py-1 rounded-md bg-[#54b830] text-white font-bold text-xs tracking-wider uppercase shadow-md">
              BENCHMARK
            </div>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#fa8207] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#e67503] transition-all duration-300 z-20">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </div>
      ),
    },
    {
      id: "bis-standards-engine",
      title: "BIS Standards Engine",
      category: "SIH 2026 Winner • Semantic Search",
      description: "Semantic vector search over 20,000+ national standards",
      tags: ["FastEmbed", "pgvector", "Hybrid Search", "PostgreSQL", "Next.js"],
      link: "https://github.com/rishiiicreates",
      renderBanner: () => (
        <div className="relative w-full h-full bg-[#000000] flex items-center justify-center overflow-hidden p-6">
          <svg
            className="w-full h-44 sm:h-52 text-[#00ff88] overflow-visible"
            viewBox="0 0 500 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse cx="160" cy="120" rx="90" ry="60" fill="#00ff88" opacity="0.12" />
            <ellipse cx="340" cy="120" rx="90" ry="60" fill="#00ff88" opacity="0.12" />

            <path
              d="M 250 120 C 190 20, 80 20, 80 120 C 80 220, 190 220, 250 120 C 310 20, 420 20, 420 120 C 420 220, 310 220, 250 120 Z"
              stroke="#00ff88"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="3 14"
              filter="url(#greenGlow)"
              className="animate-pulse"
            />
            <path
              d="M 250 120 C 190 20, 80 20, 80 120 C 80 220, 190 220, 250 120 C 310 20, 420 20, 420 120 C 420 220, 310 220, 250 120 Z"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="2 18"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#00ff88] bg-black/60 px-3 py-1 rounded-full border border-[#00ff88]/30 backdrop-blur-sm">
              20K+ STANDARDS • DENSE EMBEDDINGS
            </span>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#fa8207] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#e67503] transition-all duration-300 z-20">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </div>
      ),
    },
    {
      id: "doubt-solver-ai",
      title: "Doubt Solver AI",
      category: "Scalable STEM education platform",
      description: "High-concurrency multimodal STEM education engine",
      tags: ["FastAPI", "React", "LaTeX OCR", "Vector Search", "Gemini Pro"],
      link: "https://github.com/rishiiicreates",
      renderBanner: () => (
        <div className="relative w-full h-full bg-gradient-to-br from-[#ea2027] via-[#ee5253] to-[#ff793f] flex items-center justify-center overflow-hidden p-6">
          <div className="absolute size-72 rounded-full border-4 border-white/20" />
          <div className="absolute size-44 rounded-full border-2 border-white/30" />
          <div className="absolute size-24 rounded-full bg-white/20 backdrop-blur-sm" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/95 px-6 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 transform group-hover:scale-105 transition-transform duration-300">
              <span className="size-3.5 rounded-full bg-[#ea2027] animate-ping" />
              <span className="text-2xl sm:text-3xl font-black text-[#1b1b1b] tracking-tight">
                DoubtSolver
              </span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-wider uppercase">
              MULTIMODAL STEM OCR • HIGH CONCURRENCY
            </span>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#fa8207] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#e67503] transition-all duration-300 z-20">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </div>
      ),
    },
  ];

  const isDarkNav = activeSection === "about";

  return (
    <div className="relative w-full min-h-screen bg-[#f5efe6] text-[#1b1b1b] flex flex-col select-none overflow-x-clip">
      {/* ========================================================================= */}
      {/* GLOBAL FIXED TOP NAVIGATION                                                */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 sm:px-12 md:px-16 py-5 md:py-6 transition-colors duration-300 pointer-events-none">
        {/* Left: 3D Wireframe Cube Icon */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={scrollToTop}
            className={`size-10 sm:size-11 flex items-center justify-center transition-colors cursor-pointer ${
              isDarkNav ? "text-white" : "text-[#1b1b1b]"
            }`}
            aria-label="Back to top"
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-8"
            >
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" />
              <line x1="16" y1="2" x2="16" y2="30" />
              <line x1="2" y1="10" x2="30" y2="10" />
              <polyline points="10,18 7,20 10,22" />
              <polyline points="22,18 25,20 22,22" />
            </svg>
          </button>
        </div>

        {/* Center: Interactive Capsule Nav */}
        <nav
          className={`pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-md ${
            isDarkNav
              ? "bg-[#021833]/85 border border-cyan-500/30 text-white"
              : "bg-[#ebe4d8]/90 border border-[#1b1b1b]/[0.06] text-[#1b1b1b]"
          }`}
        >
          <button
            type="button"
            onClick={scrollToAbout}
            onMouseEnter={() => playSound("hover")}
            className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeSection === "about"
                ? "bg-[#0090ff] text-white shadow-sm"
                : isDarkNav
                ? "text-white/80 hover:text-white"
                : "text-[#1b1b1b]/80 hover:text-[#1b1b1b]"
            }`}
          >
            About
          </button>

          <button
            type="button"
            onClick={scrollToProjects}
            onMouseEnter={() => playSound("hover")}
            className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeSection === "projects"
                ? "bg-[#fa8207] text-white shadow-sm"
                : isDarkNav
                ? "text-white/80 hover:text-white"
                : "text-[#1b1b1b]/80 hover:text-[#1b1b1b]"
            }`}
          >
            Projects
          </button>

          <Link
            href="/contact"
            onClick={() => playSound("click")}
            onMouseEnter={() => playSound("hover")}
            className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-colors ${
              isDarkNav ? "text-white/80 hover:text-white" : "text-[#1b1b1b]/80 hover:text-[#1b1b1b]"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right: GET IN TOUCH & Audio Button */}
        <div className="pointer-events-auto flex items-center gap-3">
          <a
            href="mailto:rishiicreates@gmail.com"
            onClick={(e) => handleCopyEmail(e)}
            onMouseEnter={() => playSound("hover")}
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#fa8207] hover:bg-[#e67503] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {showCopied ? "Email Copied!" : "Get In Touch"}
          </a>

          <button
            type="button"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) {
                const audio = new Audio("/audio/click.ogg");
                audio.volume = 0.4;
                audio.play().catch(() => {});
              }
            }}
            onMouseEnter={() => playSound("hover")}
            className={`size-10 sm:size-11 rounded-full flex items-center justify-center transition-all shadow-sm focus:outline-none cursor-pointer ${
              isDarkNav
                ? "bg-white/[0.1] border border-white/[0.15] text-white hover:bg-white/[0.2]"
                : "bg-[#dfd5c7] text-[#1b1b1b] hover:bg-[#d4c9b9]"
            }`}
            aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
          >
            {audioEnabled ? (
              <Volume2 className="size-4 sm:size-5" />
            ) : (
              <VolumeX className="size-4 sm:size-5" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONTINUOUS 3D INTRO WRAPPER (HERO -> ABOUT CONTINUOUS SCROLL ANIMATION)   */}
      {/* Exact David Heckhoff Architecture: Single Canvas in Sticky Container     */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[2800px]">
        {/* Sticky 100vh viewport hosting the single WebGL canvas & overlays */}
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          {/* 1. Single Unified 3D WebGL Canvas */}
          <DavidInteractiveExperience3D scrollProgress={scrollProgress} />

          {/* 2. HERO DOM OVERLAY (Fades out smoothly between scroll 0 and 220px) */}
          <div
            className="absolute inset-0 pointer-events-none flex flex-col justify-between"
            style={{
              opacity: heroOpacity,
              visibility: heroOpacity <= 0.01 ? "hidden" : "visible",
            }}
          >
            {/* Top spacing for header */}
            <div className="h-24 w-full" />

            {/* Hero Left Content: Editorial Title + Tilted Role Badge */}
            <div className="relative z-10 px-6 sm:px-14 md:px-20 lg:px-28 flex flex-col items-center md:items-start justify-center pb-8 md:pb-16 flex-1">
              <div className="relative w-fit pointer-events-auto select-none">
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.8rem] font-black tracking-tight text-[#1b1b1b] leading-[0.88] text-center md:text-left">
                  Hrishikesh
                  <br />
                  Yadav
                </h1>

                {/* Tilted Navy Role Badge positioned under name */}
                <div className="absolute -bottom-3 sm:-bottom-4 right-1 sm:-right-4 md:-right-6">
                  <div className="-rotate-[5deg] px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-md bg-[#233261] text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md">
                    AI & SYSTEMS ENGINEER
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Scroll Down Prompt */}
            <div className="relative z-10 pb-6 flex justify-center pointer-events-auto">
              <button
                type="button"
                onClick={scrollToAbout}
                onMouseEnter={() => playSound("hover")}
                className="flex flex-col items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#1b1b1b]/60 hover:text-[#1b1b1b] transition-colors cursor-pointer group"
              >
                <span>Scroll to About</span>
                <ChevronDown className="size-4 animate-bounce group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 3. ABOUT DOM HUD CARDS (Fades in smoothly between 450px and 850px) */}
          <div
            className="absolute inset-0 pointer-events-none flex flex-col justify-between py-24 sm:py-28"
            style={{
              opacity: aboutOpacity,
              visibility: aboutOpacity <= 0.01 ? "hidden" : "visible",
            }}
          >
            {/* Top Row Callouts */}
            <div className="w-full flex-1 px-6 sm:px-12 md:px-16 flex flex-col justify-between">
              <div className="w-full flex flex-col md:flex-row justify-between items-start gap-6 pointer-events-auto">
                {/* Box 1: Identity & Role */}
                <div className="relative max-w-sm rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-500/30 p-5 shadow-[0_8px_32px_rgba(0,240,255,0.15)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
                      AGENT_ID {"//"} 042
                    </span>
                    <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Hrishikesh Yadav</h2>
                  <div className="flex items-center gap-1.5 text-xs text-cyan-300/80 mt-1 font-mono">
                    <MapPin className="size-3.5 text-cyan-400" />
                    <span>Delhi NCR, India • Remote</span>
                  </div>
                  <p className="text-xs text-white/75 mt-3 leading-relaxed">
                    Founder & FDE @ Operant. Systems engineer building autonomous AI agents, enterprise RAG pipelines, and high-performance WebGL environments.
                  </p>
                </div>

                {/* Box 2: Core Technical Matrix */}
                <div className="relative max-w-sm rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-500/30 p-5 shadow-[0_8px_32px_rgba(0,240,255,0.15)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="size-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                      Technical Matrix
                    </h3>
                  </div>
                  <ul className="space-y-1.5 text-xs font-mono text-white/80">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      <span>Python, TypeScript, Java, C++, SQL</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      <span>FastAPI, Spring Boot WebFlux, Next.js</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      <span>RAG, ChromaDB, pgvector, FastEmbed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      <span>MCP Protocols, Playwright, Docker, Redis</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Row Callouts */}
              <div className="w-full flex flex-col md:flex-row justify-between items-end gap-6 mt-12 pointer-events-auto">
                {/* Box 3: Academics (SRM IST & IIT Guwahati) */}
                <div className="relative max-w-sm rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-500/30 p-5 shadow-[0_8px_32px_rgba(0,240,255,0.15)]">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="size-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                      Education & Dual Degree
                    </h3>
                  </div>
                  <div className="text-xs text-white/80 space-y-2 mt-2">
                    <div>
                      <p className="font-bold text-white">SRM IST — B.Tech Computer Science</p>
                      <p className="text-[11px] font-mono text-cyan-300/80">2023 - 2027 • CGPA 9.17</p>
                    </div>
                    <div>
                      <p className="font-bold text-white">IIT Guwahati — BS Data Science & AI</p>
                      <p className="text-[11px] font-mono text-cyan-300/80">2024 - 2028 • CGPA 9.0</p>
                    </div>
                  </div>
                </div>

                {/* Box 4: Honors & National Competitions */}
                <div className="relative max-w-sm rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-500/30 p-5 shadow-[0_8px_32px_rgba(0,240,255,0.15)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="size-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                      National Honors
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-white">
                    Winner — Smart India Hackathon (SIH 2026)
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    Built BIS Standards Recommendation Engine indexing 20,000+ national compliance documents with hybrid sub-200ms semantic search.
                  </p>
                </div>
              </div>
            </div>

            {/* Scroll Prompt to Projects */}
            <div className="relative z-10 pt-4 flex justify-center pointer-events-auto">
              <button
                type="button"
                onClick={scrollToProjects}
                onMouseEnter={() => playSound("hover")}
                className="flex flex-col items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300/70 hover:text-cyan-300 transition-colors cursor-pointer group"
              >
                <span>Scroll to Projects</span>
                <ChevronDown className="size-4 animate-bounce group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Structural Navigation Anchors */}
        <div id="hero" className="absolute top-0 w-full h-1 pointer-events-none" />
        <div id="about" className="absolute top-[1050px] w-full h-1 pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 3. SELECTED PROJECTS SECTION: 2-Column Bento Grid (Clean Beige, No Grid) */}
      {/* ========================================================================= */}
      <section
        id="projects"
        className="relative z-20 w-full px-6 sm:px-12 md:px-20 lg:px-24 py-24 sm:py-28 border-t border-[#1b1b1b]/10 bg-[#f5efe6]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header matching uploaded_media_1790705874357.png */}
          <div className="mb-14 sm:mb-16">
            <div className="-rotate-[4deg] inline-block px-3 py-1 bg-[#233261] text-white font-mono text-xs font-black uppercase rounded shadow-sm tracking-widest">
              SELECTED
            </div>
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-black text-[#1b1b1b] tracking-tight mt-1">
              Projects
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#1b1b1b]/70 max-w-xl font-medium">
              High-throughput production RAG engines, autonomous agent perception environments, and interactive WebGL systems.
            </p>
          </div>

          {/* 2-Column Responsive Bento Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {PROJECTS.map((proj) => (
              <article
                key={proj.id}
                onMouseEnter={() => playSound("hover")}
                className="group flex flex-col cursor-pointer"
                onClick={() => {
                  playSound("click");
                  window.open(proj.link, "_blank");
                }}
              >
                {/* Large Rounded Visual Banner Container */}
                <div className="relative w-full aspect-[16/10] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300">
                  {proj.renderBanner()}
                </div>

                {/* Title & Subtitle below banner */}
                <div className="mt-4 flex flex-col">
                  <h3 className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-[#1b1b1b] group-hover:text-[#fa8207] transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#666666] font-medium mt-0.5">
                    {proj.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FOOTER: Start a new project / Let's work together!                      */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full px-6 md:px-16 py-12 flex flex-col items-center justify-center text-center bg-[#ede7df] border-t border-[#1b1b1b]/10">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1b1b1b] tracking-tight">
          Start a new project
        </h3>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#fa8207] mt-1">
          Let&apos;s work together!
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:rishiicreates@gmail.com"
            onClick={(e) => handleCopyEmail(e)}
            onMouseEnter={() => playSound("hover")}
            className="px-8 py-3 rounded-full bg-[#fa8207] hover:bg-[#e67503] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {showCopied ? "Email Copied!" : "rishiicreates@gmail.com"}
          </a>
          <Link
            href="/contact"
            onClick={() => playSound("click")}
            onMouseEnter={() => playSound("hover")}
            className="px-8 py-3 rounded-full bg-white hover:bg-[#f2ede6] text-[#1b1b1b] font-bold text-xs uppercase tracking-wider border border-[#1b1b1b]/10 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Open 3D Contact Room
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between w-full max-w-6xl text-xs text-[#1b1b1b]/60 border-t border-[#1b1b1b]/10 pt-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#1b1b1b] transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-[#1b1b1b] transition-colors">
              Legal Notice
            </Link>
          </div>
          <p>© 2026 Hrishikesh Yadav (Rishii)</p>
        </div>
      </footer>
    </div>
  );
}
