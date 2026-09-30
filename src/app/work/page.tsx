"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DavidInteractiveExperience3D from "@/components/DavidInteractiveExperience3D";
import {
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
  const [showCopied, setShowCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<"hero" | "about" | "projects">("hero");

  const [anchors, setAnchors] = useState<{
    details: { x: number; y: number };
    desc: { x: number; y: number };
    services: { x: number; y: number };
  } | null>(null);

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

      // 1. Hero transition: stays static until 120px, then room lifts cleanly between 120px and 850px
      const hOut = sy < 120 ? 0 : Math.max(0, Math.min(1, (sy - 120) / 730));
      setHeroOut(hOut);

      // Hero editorial text fades out smoothly between 80px and 320px
      const hOpacity = sy < 80 ? 1 : Math.max(0, Math.min(1, 1 - (sy - 80) / 240));
      setHeroOpacity(hOpacity);

      // 2. Scan progress: strictly 0 while room is lifting (< 850px);
      // sweeps smoothly and proportionally from 0.0 to 1.0 between 850px and 2500px
      const sProg = sy < 850 ? 0 : Math.max(0, Math.min(1, (sy - 850) / 1650));
      setScanProgress(sProg);

      // 3. About exit into Projects: 2600px to 3250px
      const aOut = sy > 2600 ? Math.max(0, Math.min(1, (sy - 2600) / 650)) : 0;
      setAboutOut(aOut);

      // About HUD overlay opacity: fades in at 850px, stays until 2600px, then rolls out
      let aOpacity = 0;
      if (sy >= 850 && sy < 2600) {
        aOpacity = Math.max(0, Math.min(1, (sy - 850) / 200));
      } else if (sy >= 2600) {
        aOpacity = Math.max(0, Math.min(1, 1 - (sy - 2600) / 300));
      }
      setAboutOpacity(aOpacity);

      // Navigation state tracking
      if (sy >= 2600) {
        setActiveSection("projects");
      } else if (sy >= 850) {
        setActiveSection("about");
      } else {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText("rishiicreates@gmail.com").catch(() => {});
      }
    } catch {}
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2200);
  };

  const scrollToAbout = () => {
    window.scrollTo({ top: 1200, behavior: "smooth" });
  };

  const scrollToProjects = () => {
    const el = document.getElementById("projects");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
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
              <span className="size-4 rounded-full bg-[#299093]" />
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#061a1e] font-sans">
                SHIRO RAG
              </span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-wider uppercase">
              95K+ VECTORS • SUB-200MS
            </span>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#299093] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#207577] transition-all duration-300 z-20">
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

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#299093] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#207577] transition-all duration-300 z-20">
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

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#299093] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#207577] transition-all duration-300 z-20">
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

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#299093] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#207577] transition-all duration-300 z-20">
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
              <span className="text-2xl sm:text-3xl font-black text-[#061a1e] tracking-tight">
                DoubtSolver
              </span>
            </div>
            <span className="mt-3 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white font-mono text-[11px] font-bold tracking-wider uppercase">
              MULTIMODAL STEM OCR • HIGH CONCURRENCY
            </span>
          </div>

          <div className="absolute right-6 sm:right-8 size-12 sm:size-14 rounded-full bg-[#299093] text-white flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:bg-[#207577] transition-all duration-300 z-20">
            <ArrowRight className="size-5 sm:size-6" />
          </div>
        </div>
      ),
    },
  ];

  const isDarkNav = activeSection === "about";

  return (
    <div className="relative w-full min-h-screen bg-[#e8e5e0] text-[#061a1e] flex flex-col select-none overflow-x-clip">
      {/* ========================================================================= */}
      {/* GLOBAL FIXED TOP NAVIGATION: [ Home | Work | Contact ]                    */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-3 sm:px-12 md:px-16 py-3 sm:py-5 md:py-6 transition-colors duration-300 pointer-events-none">
        {/* Left: Mind Robotics Authentic Monogram */}
        <div className="pointer-events-auto">
          <Link
            href="/"
            className="group flex items-center gap-2 cursor-pointer transition-colors"
            aria-label="Back to Home"
          >
            <svg
              className={`h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-105 ${
                isDarkNav ? "text-white" : "text-[#061a1e]"
              }`}
              viewBox="0 0 80 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M25.6 51.2V12.8C25.6 5.73 19.87 0 12.8 0S0 5.73 0 12.8v38.4C0 58.27 5.73 64 12.8 64s12.8-5.73 12.8-12.8Z"
              />
              <path
                fill="currentColor"
                d="M27.2 32c0 7.07 5.73 12.8 12.8 12.8s12.8-5.73 12.8-12.8-5.73-12.8-12.8-12.8-12.8 5.73-12.8 12.8Z"
              />
              <path
                fill="currentColor"
                d="M80 51.2V12.8C80 5.73 74.27 0 67.2 0c-7.069 0-12.8 5.73-12.8 12.8v38.4c0 7.07 5.731 12.8 12.8 12.8C74.27 64 80 58.27 80 51.2Z"
              />
            </svg>
          </Link>
        </div>

        {/* Center: Interactive Capsule Nav [ Home | Work | Contact ] */}
        <nav
          className={`pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-md ${
            isDarkNav
              ? "bg-[#021833]/85 border border-cyan-500/30 text-white"
              : "bg-[#dbd7ca]/85 border border-[#061a1e]/[0.08] text-[#061a1e]"
          }`}
        >
          {/* Home Toggle */}
          <Link
            href="/"
            className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              isDarkNav
                ? "text-white/80 hover:text-white"
                : "text-[#061a1e]/75 hover:text-[#061a1e]"
            }`}
          >
            Home
          </Link>

          {/* Work Toggle (Active on this unified page) */}
          <button
            type="button"
            onClick={scrollToTop}
            className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer bg-[#299093] text-white shadow-sm"
          >
            Work
          </button>

          {/* Contact Toggle */}
          <Link
            href="/contact"
            className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-colors ${
              isDarkNav ? "text-white/80 hover:text-white" : "text-[#061a1e]/75 hover:text-[#061a1e]"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right: Signature Mind Robotics Waterfall CTA Button (No Sound Controls) */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/contact"
            className="group grid-pile hidden sm:grid h-9 md:h-11 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            <span
              className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#ef6156]"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#ffbd00] delay-[50ms]"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#061a1e] delay-[120ms]"
              aria-hidden="true"
            />
            <span className="relative z-10 px-5 sm:px-6 text-center leading-none">
              Get In Touch
            </span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONTINUOUS 3D INTRO WRAPPER (HERO -> ABOUT CONTINUOUS SCROLL ANIMATION)   */}
      {/* Exact David Heckhoff Architecture: Sticky Container with rounded-b-48px  */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[3800px]">
        {/* Sticky 100vh viewport hosting the single WebGL canvas & overlays */}
        <div className="sticky top-0 w-full h-screen overflow-hidden rounded-b-[48px] shadow-2xl">
          {/* 1. Single Unified 3D WebGL Canvas */}
          <DavidInteractiveExperience3D
            heroOut={heroOut}
            scanProgress={scanProgress}
            aboutOut={aboutOut}
            onProjectPoints={setAnchors}
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
                <h1 className="text-[2.6rem] sm:text-7xl md:text-8xl lg:text-[7.8rem] font-black tracking-tight text-[#061a1e] leading-[0.92] text-center md:text-left">
                  Hrishikesh
                  <br />
                  Yadav
                </h1>

                {/* Tilted Navy Role Badge positioned under name */}
                <div className="flex justify-center md:block md:absolute -bottom-5 sm:-bottom-4 right-1 sm:-right-4 md:-right-6 mt-3 md:mt-0">
                  <div className="-rotate-[4deg] px-3 sm:px-4 py-1 sm:py-1.5 rounded-md bg-[#061a1e] text-white font-mono font-bold text-[10px] sm:text-sm tracking-wider uppercase shadow-md">
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
                className="flex flex-col items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#061a1e]/60 hover:text-[#061a1e] transition-colors cursor-pointer group"
              >
                <span>Scroll to About</span>
                <ChevronDown className="size-4 animate-bounce group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 3. ABOUT DOM HUD CARDS (Authentic 1:1 David Heckhoff Callouts with Connector Lines) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: aboutOpacity,
              visibility: aboutOpacity <= 0.01 ? "hidden" : "visible",
            }}
          >
            {/* Box 1: Details (Top-Left: Name & Location -> Pinned to Avatar Head) */}
            {anchors && (
              <div
                className="absolute pointer-events-auto transition-opacity duration-300 hidden md:block"
                style={{
                  top: `${anchors.details.y}px`,
                  left: `${anchors.details.x}px`,
                  transform: "translate(-100%, -50%)",
                  opacity: scanProgress >= 0.2 ? Math.min(1, (scanProgress - 0.2) / 0.15) : 0,
                }}
              >
                <div className="flex items-center">
                  <div className="rounded-[12px] bg-gradient-to-b from-[#003585] to-[rgba(0,82,145,0.7)] border border-[#34bffd] px-5 py-3 shadow-[0_8px_32px_rgba(0,53,133,0.55)] backdrop-blur-md min-w-[170px]">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-none">Hrishikesh</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#e1f5ff] font-mono mt-1.5">
                      <MapPin className="size-3.5 text-[#34bffd] shrink-0" />
                      <span>India</span>
                    </div>
                  </div>
                  {/* Exact horizontal connector line pinned to 3D anchor */}
                  <div className="w-10 lg:w-12 h-[1px] bg-[#34bffd]" />
                  <div className="size-[11px] rounded-full bg-[#34bffd] shadow-[0_0_8px_#34bffd] -mr-[5.5px]" />
                </div>
              </div>
            )}

            {/* Box 2: Description (Bottom-Left -> Pinned to Avatar Waist) */}
            {anchors && (
              <div
                className="absolute pointer-events-auto transition-opacity duration-300 hidden md:block"
                style={{
                  top: `${anchors.desc.y}px`,
                  left: `${anchors.desc.x}px`,
                  transform: "translate(-100%, -50%)",
                  opacity: scanProgress >= 0.45 ? Math.min(1, (scanProgress - 0.45) / 0.15) : 0,
                }}
              >
                <div className="flex items-center">
                  <div className="rounded-[12px] bg-gradient-to-b from-[#003585] to-[rgba(0,82,145,0.7)] border border-[#34bffd] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,53,133,0.55)] backdrop-blur-md max-w-[340px] sm:max-w-[370px]">
                    <p className="text-xs sm:text-[13px] text-white leading-relaxed font-mono font-medium">
                      Founder at Operant & Systems Engineer. Architects 3-tier enterprise RAG systems, autonomous agent perception layers (Rawfy MCP), and OpenEnv benchmarking environments.
                    </p>
                  </div>
                  {/* Exact horizontal connector line pinned to 3D anchor */}
                  <div className="w-10 lg:w-12 h-[1px] bg-[#34bffd]" />
                  <div className="size-[11px] rounded-full bg-[#34bffd] shadow-[0_0_8px_#34bffd] -mr-[5.5px]" />
                </div>
              </div>
            )}

            {/* Box 3: Skills & Tech (Right -> Pinned to Avatar Right Shoulder/Chest) */}
            {anchors && (
              <div
                className="absolute pointer-events-auto transition-opacity duration-300 hidden md:block"
                style={{
                  top: `${anchors.services.y}px`,
                  left: `${anchors.services.x}px`,
                  transform: "translateY(-50%)",
                  opacity: scanProgress >= 0.7 ? Math.min(1, (scanProgress - 0.7) / 0.15) : 0,
                }}
              >
                <div className="flex items-center">
                  {/* Exact horizontal connector line pinned to 3D anchor */}
                  <div className="size-[11px] rounded-full bg-[#34bffd] shadow-[0_0_8px_#34bffd] -ml-[5.5px]" />
                  <div className="w-10 lg:w-12 h-[1px] bg-[#34bffd]" />
                  <div className="rounded-[12px] bg-gradient-to-b from-[#003585] to-[rgba(0,82,145,0.7)] border border-[#34bffd] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,53,133,0.55)] backdrop-blur-md min-w-[240px] max-w-[320px]">
                    <h3 className="text-sm font-bold text-white tracking-wider mb-2 font-mono uppercase">
                      Skills & Tech
                    </h3>
                    <ul className="space-y-1.5 text-xs font-mono text-white/90">
                      <li className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-[#34bffd] shrink-0" />
                        <span>Python, TypeScript, Java & C++</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-[#34bffd] shrink-0" />
                        <span>Enterprise RAG & pgvector (95k+ Chunks)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-[#34bffd] shrink-0" />
                        <span>FastAPI & Spring Boot (WebFlux/SSE)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-[#34bffd] shrink-0" />
                        <span>MCP Servers, Playwright & Agent Tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1 rounded-full bg-[#34bffd] shrink-0" />
                        <span>Docker, Supabase, Next.js & Three.js</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll Prompt to Projects */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex justify-center pointer-events-auto">
              <button
                type="button"
                onClick={scrollToProjects}
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
      {/* 3. SELECTED PROJECTS SECTION: 2-Column Bento Grid (Clean Concrete Canvas) */}
      {/* ========================================================================= */}
      <section
        id="projects"
        className="relative z-20 w-full px-6 sm:px-12 md:px-20 lg:px-24 py-24 sm:py-28 bg-[#e8e5e0]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header with Tilted "SELECTED" Badge */}
          <div className="mb-14 sm:mb-16">
            <div className="-rotate-[4deg] inline-block px-3 py-1 bg-[#061a1e] text-white font-mono text-xs font-black uppercase rounded shadow-sm tracking-widest">
              SELECTED
            </div>
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-black text-[#061a1e] tracking-tight mt-1">
              Projects
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#061a1e]/70 max-w-xl font-medium">
              High-throughput production RAG engines, autonomous agent perception environments, and interactive WebGL systems.
            </p>
          </div>

          {/* 2-Column Responsive Bento Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {PROJECTS.map((proj) => (
              <article
                key={proj.id}
                className="group flex flex-col cursor-pointer"
                onClick={() => {
                  window.open(proj.link, "_blank");
                }}
              >
                {/* Large Rounded Visual Banner Container */}
                <div className="relative w-full aspect-[16/10] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300">
                  {proj.renderBanner()}
                </div>

                {/* Title & Subtitle below banner */}
                <div className="mt-4 flex flex-col">
                  <h3 className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-[#061a1e] group-hover:text-[#299093] transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#061a1e]/70 font-medium mt-0.5">
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
      <footer className="relative z-20 w-full px-6 md:px-16 py-12 flex flex-col items-center justify-center text-center bg-[#e0dcd6] border-t border-[#061a1e]/10">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#061a1e] tracking-tight">
          Let&apos;s build something exceptional.
        </h3>
        <p className="text-sm sm:text-base text-[#061a1e]/70 max-w-md mt-2">
          Available for autonomous AI agent infrastructure, enterprise RAG development, and high-performance WebGL engineering.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:rishiicreates@gmail.com"
            onClick={(e) => handleCopyEmail(e)}
            className="px-6 py-2.5 rounded-full bg-[#299093] hover:bg-[#207577] text-white font-bold text-sm tracking-wider uppercase shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            {showCopied ? "Email Copied!" : "rishiicreates@gmail.com"}
          </a>

          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full bg-[#061a1e] hover:bg-[#061a1e]/85 text-white font-bold text-sm tracking-wider uppercase shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            3D Contact Room
          </Link>
        </div>

        <p className="text-xs text-[#061a1e]/50 font-mono mt-8">
          © {new Date().getFullYear()} Hrishikesh Yadav. Built with Next.js, Three.js & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
