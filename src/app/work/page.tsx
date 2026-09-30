"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DavidInteractiveExperience3D from "@/components/DavidInteractiveExperience3D";
import {
  Volume2,
  VolumeX,
  MapPin,
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

export default function WorkPage() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"hero" | "about" | "projects">("hero");

  // Scroll states for continuous 3D WebGL timeline
  const [scrollY, setScrollY] = useState(0);
  const [heroOut, setHeroOut] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [aboutOut, setAboutOut] = useState(0);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [aboutOpacity, setAboutOpacity] = useState(0);

  // Synchronize scroll position with continuous 3D WebGL timeline
  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      setScrollY(sy);

      // Hero transition: 0px to 650px
      const hOut = Math.max(0, Math.min(1, sy / 650));
      setHeroOut(hOut);

      // Hero editorial text fades out smoothly between 0 and 220px
      const hOpacity = Math.max(0, Math.min(1, 1 - sy / 220));
      setHeroOpacity(hOpacity);

      // Scan progress: 700px to 1950px sweeps from 0% to 100%
      const sProg = Math.max(0, Math.min(1, (sy - 700) / 1250));
      setScanProgress(sProg);

      // About HUD overlay opacity: fades in between 600px and 900px, stays until 2050px, fades out
      let aOpacity = 0;
      if (sy >= 600 && sy < 2050) {
        aOpacity = Math.max(0, Math.min(1, (sy - 600) / 300));
      } else if (sy >= 2050) {
        aOpacity = Math.max(0, Math.min(1, 1 - (sy - 2050) / 300));
      }
      setAboutOpacity(aOpacity);

      // About exit into Projects: 2050px to 2600px
      const aOut = sy > 2050 ? Math.max(0, Math.min(1, (sy - 2050) / 550)) : 0;
      setAboutOut(aOut);

      // Navigation state tracking
      if (sy >= 2050) {
        setActiveSection("projects");
      } else if (sy >= 600) {
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
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText("rishiicreates@gmail.com").catch(() => {});
      }
    } catch {}
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
      id: "bis-compliance-engine",
      title: "BIS Standards Engine",
      category: "National compliance platform",
      description: "SIH Winner — Hybrid BM25 & semantic search for Bureau of Indian Standards",
      tags: ["Python", "Qdrant", "FastAPI", "React", "Hybrid Search"],
      link: "https://github.com/rishiiicreates",
      renderBanner: () => (
        <div className="relative w-full h-full bg-[#051923] flex items-center justify-center overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(#00a8e8_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/95 px-6 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl">🏆</span>
              <span className="text-2xl sm:text-3xl font-black text-[#003459] tracking-tight">
                SIH Winner
              </span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-[#00a8e8]/25 text-[#00f0ff] font-mono text-[11px] font-bold tracking-wider uppercase border border-[#00a8e8]/40">
              20K+ STANDARDS • HYBRID SEARCH
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
      category: "Multimodal educational assistant",
      description: "Real-time LaTeX OCR equation solver & step-by-step reasoning",
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
      {/* GLOBAL FIXED TOP NAVIGATION: [ Home | Work | Contact ]                    */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-3 sm:px-12 md:px-16 py-3 sm:py-5 md:py-6 transition-colors duration-300 pointer-events-none">
        {/* Left: 3D Wireframe Cube Icon */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            onClick={() => playSound("click")}
            className={`size-9 sm:size-11 flex items-center justify-center transition-colors cursor-pointer ${
              isDarkNav ? "text-white" : "text-[#1b1b1b]"
            }`}
            aria-label="Back to Home"
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-7 sm:size-8"
            >
              <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" />
              <line x1="16" y1="2" x2="16" y2="30" />
              <line x1="2" y1="10" x2="30" y2="10" />
              <polyline points="10,18 7,20 10,22" />
              <polyline points="22,18 25,20 22,22" />
            </svg>
          </Link>
        </div>

        {/* Center: Interactive Capsule Nav [ Home | Work | Contact ] */}
        <nav
          className={`pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-md ${
            isDarkNav
              ? "bg-[#021833]/85 border border-cyan-500/30 text-white"
              : "bg-[#ebe4d8]/90 border border-[#1b1b1b]/[0.06] text-[#1b1b1b]"
          }`}
        >
          {/* Home Toggle */}
          <Link
            href="/"
            onClick={() => playSound("click")}
            onMouseEnter={() => playSound("hover")}
            className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isDarkNav
                ? "text-white/80 hover:text-white"
                : "text-[#1b1b1b]/80 hover:text-[#1b1b1b]"
            }`}
          >
            Home
          </Link>

          {/* Work Toggle (Active on this unified page) */}
          <button
            type="button"
            onClick={scrollToTop}
            onMouseEnter={() => playSound("hover")}
            className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer bg-[#299093] text-white shadow-sm"
          >
            Work
          </button>

          {/* Contact Toggle */}
          <Link
            href="/contact"
            onClick={() => playSound("click")}
            onMouseEnter={() => playSound("hover")}
            className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-colors ${
              isDarkNav ? "text-white/80 hover:text-white" : "text-[#1b1b1b]/80 hover:text-[#1b1b1b]"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right: GET IN TOUCH & Audio Button */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <a
            href="mailto:rishiicreates@gmail.com"
            onClick={(e) => handleCopyEmail(e)}
            onMouseEnter={() => playSound("hover")}
            className="hidden sm:inline-flex px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#fa8207] hover:bg-[#e67503] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
            className={`size-9 sm:size-11 rounded-full flex items-center justify-center transition-all shadow-sm focus:outline-none cursor-pointer ${
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
      {/* Exact David Heckhoff Architecture: Sticky Container with rounded-b-48px  */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[3200px]">
        {/* Sticky 100vh viewport hosting the single WebGL canvas & overlays */}
        <div className="sticky top-0 w-full h-screen overflow-hidden rounded-b-[48px] shadow-2xl">
          {/* 1. Single Unified 3D WebGL Canvas */}
          <DavidInteractiveExperience3D
            heroOut={heroOut}
            scanProgress={scanProgress}
            aboutOut={aboutOut}
          />

          {/* 2. HERO DOM OVERLAY (Fades out smoothly between scroll 0 and 220px) */}
          <div
            className="absolute inset-0 pointer-events-none flex flex-col justify-between"
            style={{
              opacity: heroOpacity,
              visibility: heroOpacity <= 0.01 ? "hidden" : "visible",
            }}
          >
            {/* Top spacing for header */}
            <div className="h-20 sm:h-24 w-full" />

            {/* Hero Content: Editorial Title + Tilted Role Badge */}
            <div className="relative z-10 px-6 sm:px-14 md:px-20 lg:px-28 flex flex-col items-center md:items-start justify-start md:justify-center pt-2 sm:pt-0 pb-8 md:pb-16 flex-1">
              <div className="relative w-fit pointer-events-auto select-none">
                <h1 className="text-[2.6rem] sm:text-7xl md:text-8xl lg:text-[7.8rem] font-black tracking-tight text-[#1b1b1b] leading-[0.92] text-center md:text-left">
                  Hrishikesh
                  <br />
                  Yadav
                </h1>

                {/* Tilted Navy Role Badge positioned under name */}
                <div className="flex justify-center md:block md:absolute -bottom-5 sm:-bottom-4 right-1 sm:-right-4 md:-right-6 mt-3 md:mt-0">
                  <div className="-rotate-[4deg] px-3 sm:px-4 py-1 sm:py-1.5 rounded-md bg-[#233261] text-white font-mono font-bold text-[10px] sm:text-sm tracking-wider uppercase shadow-md">
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

          {/* 3. ABOUT DOM HUD CARDS (Authentic 1:1 David Heckhoff Callouts with Connector Lines) */}
          <div
            className="absolute inset-0 pointer-events-none flex flex-col justify-between py-24 sm:py-28"
            style={{
              opacity: aboutOpacity,
              visibility: aboutOpacity <= 0.01 ? "hidden" : "visible",
            }}
          >
            {/* Top Row / Upper Area Callouts */}
            <div className="w-full flex-1 px-6 sm:px-12 md:px-16 flex flex-col justify-between">
              <div className="w-full flex flex-col md:flex-row justify-between items-start gap-6 pointer-events-auto">
                {/* Box 1: Identity & Location (Top-Left) */}
                <div
                  className="relative flex items-center transition-all duration-300"
                  style={{
                    opacity: scrollY >= 700 ? Math.min(1, (scrollY - 700) / 150) : 0,
                    transform: `translateX(${scrollY >= 700 ? 0 : -30}px)`,
                  }}
                >
                  <div className="rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-400/35 px-5 py-3.5 shadow-[0_8px_32px_rgba(0,240,255,0.18)] min-w-[200px]">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Hrishikesh</h3>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono mt-1">
                      <MapPin className="size-3.5 text-cyan-400 shrink-0" />
                      <span>Delhi NCR, India • Remote</span>
                    </div>
                  </div>
                  {/* Horizontal connector line extending right to avatar */}
                  <div className="hidden sm:block w-12 h-[1px] bg-cyan-400/80 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  </div>
                </div>

                {/* Box 3: Skills Matrix (Right) */}
                <div
                  className="relative flex items-center flex-row-reverse transition-all duration-300 pointer-events-auto"
                  style={{
                    opacity: scrollY >= 1350 ? Math.min(1, (scrollY - 1350) / 150) : 0,
                    transform: `translateX(${scrollY >= 1350 ? 0 : 30}px)`,
                  }}
                >
                  <div className="rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-400/35 p-5 shadow-[0_8px_32px_rgba(0,240,255,0.18)] min-w-[240px]">
                    <h3 className="text-base font-black text-white tracking-tight mb-2.5 font-mono uppercase">
                      Skills
                    </h3>
                    <ul className="space-y-1.5 text-xs font-mono text-white/85">
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>Three.js & WebGL</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>Python & FastAPI</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>TypeScript & Next.js</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>RAG, ChromaDB & Qdrant</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>Autonomous Agents & MCP</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>Docker & Distributed Systems</span>
                      </li>
                    </ul>
                  </div>
                  {/* Horizontal connector line extending left to avatar */}
                  <div className="hidden sm:block w-12 h-[1px] bg-cyan-400/80 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  </div>
                </div>
              </div>

              {/* Bottom Row / Lower Area Callouts */}
              <div className="w-full flex flex-col md:flex-row justify-between items-end gap-6 mt-8 pointer-events-auto">
                {/* Box 2: Bio & Systems Philosophy (Bottom-Left) */}
                <div
                  className="relative flex items-center transition-all duration-300"
                  style={{
                    opacity: scrollY >= 1000 ? Math.min(1, (scrollY - 1000) / 150) : 0,
                    transform: `translateX(${scrollY >= 1000 ? 0 : -30}px)`,
                  }}
                >
                  <div className="rounded-2xl bg-[#021833]/85 backdrop-blur-md border border-cyan-400/35 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,240,255,0.18)] max-w-sm">
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-mono">
                      Founder & FDE @ Operant. Builds autonomous AI agents, enterprise RAG pipelines, and interactive 3D WebGL experiences that are fast, responsive, and reliable.
                    </p>
                  </div>
                  {/* Horizontal connector line extending right to avatar */}
                  <div className="hidden sm:block w-12 h-[1px] bg-cyan-400/80 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                  </div>
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
      {/* 3. SELECTED PROJECTS SECTION: 2-Column Bento Grid (Clean Warm Beige)       */}
      {/* ========================================================================= */}
      <section
        id="projects"
        className="relative z-20 w-full px-6 sm:px-12 md:px-20 lg:px-24 py-24 sm:py-28 bg-[#f5efe6]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header with Tilted "SELECTED" Badge */}
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
          Let&apos;s build something exceptional.
        </h3>
        <p className="text-sm sm:text-base text-[#666666] max-w-md mt-2">
          Available for autonomous AI agent infrastructure, enterprise RAG development, and high-performance WebGL engineering.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:rishiicreates@gmail.com"
            onClick={(e) => handleCopyEmail(e)}
            className="px-6 py-2.5 rounded-full bg-[#fa8207] hover:bg-[#e67503] text-white font-bold text-sm tracking-wider uppercase shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            {showCopied ? "Email Copied!" : "rishiicreates@gmail.com"}
          </a>

          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full bg-[#061a1e] hover:bg-[#1b1b1b] text-white font-bold text-sm tracking-wider uppercase shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            3D Contact Room
          </Link>
        </div>

        <p className="text-xs text-[#999999] font-mono mt-8">
          © {new Date().getFullYear()} Hrishikesh Yadav. Built with Next.js, Three.js & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
