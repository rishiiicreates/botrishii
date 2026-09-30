"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HeroRobotArm3D from "./HeroRobotArm3D";
import FanTag from "./FanTag";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Where the busywork lives",
    src: "/images/hero-busywork-queue.png",
    alt: "Where the busywork lives",
  },
  {
    id: 2,
    title: "Where the copy-paste happens",
    src: "/images/hero-copypaste-schema.png",
    alt: "Where the copy-paste happens",
  },
  {
    id: 3,
    title: "Where things quietly break",
    src: "/images/hero-pipeline-traceback.png",
    alt: "Where things quietly break",
  },
  {
    id: 4,
    title: "Where automation steps in",
    src: "/images/hero-automation-orchestration.png",
    alt: "Where automation steps in",
  },
];

import { WORDMARK_MARKS } from "./wordmarkMarks";


export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [section1CanReveal, setSection1CanReveal] = useState(false);
  const section1Ref = useRef<HTMLElement | null>(null);
  const wordmarkRef = useRef<HTMLSpanElement | null>(null);
  const lessSvgRef = useRef<SVGSVGElement | null>(null);

  // Dynamically set --wordmark-scale from rendered SVG height
  useEffect(() => {
    const wordmarkEl = wordmarkRef.current;
    const lessEl = lessSvgRef.current;
    if (!wordmarkEl || !lessEl) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (entry) {
        wordmarkEl.style.setProperty("--wordmark-scale", String(entry.contentRect.height / 100));
      }
    });
    observer.observe(lessEl);
    return () => observer.disconnect();
  }, []);

  // Autoplay carousel timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Track scroll for authentic parallax based on Section 0 container height
  useEffect(() => {
    const handleScroll = () => {
      const svmin = Math.min(window.innerWidth, window.innerHeight);
      const totalH = window.innerHeight * 1.5 + svmin * 0.75;
      const p = Math.min(Math.max(window.scrollY / totalH, 0), 1);
      setScrollProgress(p);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section 1 Reveal Observer
  useEffect(() => {
    const el = section1Ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSection1CanReveal(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const leftY = -22 + scrollProgress * 16; // -22% to -6%
  const rightY = scrollProgress * 10; // 0% to 10%

  return (
    <>
      {/* SECTION 0: Hero 3D Arm, Wordmark, and Parallax Capsules */}
      <section className="px-6 md:px-8 desktop:px-8 relative flex flex-col gap-y-24 tablet:gap-y-[110px] laptop:gap-y-[120px] desktop:gap-y-[130px] pt-[140px] tablet:pt-[320px] laptop:pt-[340px] desktop:pt-[360px]">
        {/* 3D Cel-shaded Arm Viewport */}
        <div className="z-above-content pointer-events-none absolute inset-x-0 top-0 bottom-[-62svmin]">
          <HeroRobotArm3D />
        </div>

        {/* Wordmark Presentation - Positioned in the Lower Part of Initial Viewport */}
        <span
          ref={wordmarkRef}
          className="z-above-content tablet:gap-[4.5vw] flex flex-col gap-[8vw] select-none"
          aria-label="Less Busywork"
        >
          {/* "LESS" Wordmark SVG */}
          <svg
            ref={lessSvgRef}
            className="tablet:h-[9.6vw] tablet:w-auto w-[38%] aspect-[272/100] self-start text-current wordmark-reveal overflow-visible"
            viewBox={WORDMARK_MARKS.less.viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {WORDMARK_MARKS.less.letters.map((letterPaths, idx) => (
              <g key={idx} style={{ "--index": idx } as React.CSSProperties}>
                <path d={letterPaths.join(" ")} fill="currentColor" fillOpacity={0} />
                {letterPaths.map((d, subIdx) => (
                  <path
                    key={subIdx}
                    d={d}
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={1.01}
                    strokeDashoffset={1.01}
                    pathLength={1}
                  />
                ))}
              </g>
            ))}
          </svg>

          {/* "BUSYWORK" Wordmark SVG */}
          <svg
            className="tablet:h-[9.6vw] tablet:w-auto w-[88%] tablet:w-auto aspect-[716/100] self-end text-current wordmark-reveal overflow-visible"
            viewBox={WORDMARK_MARKS.busywork.viewBox}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ "--index-start": WORDMARK_MARKS.less.letters.length } as React.CSSProperties}
          >
            {WORDMARK_MARKS.busywork.letters.map((letterPaths, idx) => (
              <g key={idx} style={{ "--index": idx } as React.CSSProperties}>
                <path d={letterPaths.join(" ")} fill="currentColor" fillOpacity={0} />
                {letterPaths.map((d, subIdx) => (
                  <path
                    key={subIdx}
                    d={d}
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={1.01}
                    strokeDashoffset={1.01}
                    pathLength={1}
                  />
                ))}
              </g>
            ))}
          </svg>
        </span>

        {/* Background Capsule Silhouettes - Pure Recreated Architectural Pills with Zero Internal Padding */}
        <div className="flex justify-between laptop:px-[inherit] select-none pointer-events-none -mb-20 tablet:-mb-28 laptop:-mb-32">
          {/* Left Capsule - Top dome subtly peeking in from bottom-left behind the lower wordmark */}
          <span
            className="w-[32%] rounded-full bg-white dark:bg-[#0c2226] border border-[#061a1e]/[0.06] dark:border-white/10 shadow-[0_20px_50px_rgba(6,26,30,0.04)] aspect-[2/3.8] z-behind-content will-change-transform block p-0 m-0"
            style={{ transform: `translateY(${leftY}%)` }}
            aria-hidden="true"
          />

          {/* Right Capsule */}
          <span
            className="w-[32%] rounded-full bg-white dark:bg-[#0c2226] border border-[#061a1e]/[0.06] dark:border-white/10 shadow-[0_20px_50px_rgba(6,26,30,0.04)] aspect-[2/3.8] z-behind-content will-change-transform block p-0 m-0"
            style={{ transform: `translateY(${rightY}%)` }}
            aria-hidden="true"
          />
        </div>
      </section>

      {/* SECTION 1: Main Statement & Narrative Copy */}
      <section
        ref={section1Ref}
        className="layout-grid laptop:gap-y-14 gap-y-8 pt-[3.6rem] tablet:pt-[5.2rem] pb-[6.4rem] tablet:pb-[11.2rem]"
      >
        {/* Headline with Staggered Multi-Color Fan Tags */}
        <h1 className="text-heading-1 tablet:col-span-9 tablet:col-start-2 laptop:col-span-9 laptop:col-start-3 laptop:max-w-[100rem] col-span-6 col-start-1 text-balance">
          <span
            role="text"
            aria-label="We build automations that quietly handle the work nobody wants."
          >
            {/* Pill 1: We build */}
            <span className="-ml-[var(--tag-padding-inline)]">
              <FanTag
                text="We build"
                color="#299093"
                textColor="text-white"
                size="headline"
                canReveal={section1CanReveal}
                delay={0}
              />
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "0.2s" } as React.CSSProperties}
            >
              automations
            </span>{" "}
            <span
              className="headline-word mr-[var(--tag-padding-inline)]"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "0.4s" } as React.CSSProperties}
            >
              that
            </span>{" "}
            {/* Pill 2: quietly */}
            <span className="-ml-[var(--tag-padding-inline)] mr-[var(--tag-padding-inline)]">
              <FanTag
                text="quietly"
                color="#ffffff"
                textColor="text-[#061a1e]"
                size="headline"
                canReveal={section1CanReveal}
                delay={0.6}
              />
            </span>{" "}
            {/* Pill 3: handle */}
            <span className="-ml-[var(--tag-padding-inline)]">
              <FanTag
                text="handle"
                color="#ef6156"
                textColor="text-[#061a1e]"
                size="headline"
                canReveal={section1CanReveal}
                delay={0.8}
              />
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.0s" } as React.CSSProperties}
            >
              the
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.2s" } as React.CSSProperties}
            >
              work
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.4s" } as React.CSSProperties}
            >
              nobody
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.6s" } as React.CSSProperties}
            >
              wants.
            </span>
          </span>
        </h1>

        {/* Supporting Narrative Paragraphs */}
        <div className="text-paragraph-large tablet:col-span-7 tablet:col-start-2 laptop:col-span-5 laptop:col-start-3 laptop:max-w-[60rem] col-span-6 col-start-1">
          <p>
            <strong className="font-bold">I don&apos;t start with code.</strong> I
            start by asking one question: what task makes people sigh out loud? Then I build
            something that does it faster, quieter, and without coffee breaks, starting with the
            workflows nobody wants to own.
          </p>
          <p>
            Under the hood are agents that route tasks, pull the right context, and call the right
            tools, all plugged into whatever your team already uses. No rip-and-replace, no
            six-month migration, no mandatory kickoff meeting.
          </p>
        </div>
      </section>

      {/* SECTION 2: Full-Bleed 2:1 Hero Photography Carousel */}
      <section
        className="relative grid-pile w-full aspect-[2/1] overflow-hidden bg-black/40 border-y border-black/10 dark:border-white/10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <ol className="grid-pile size-full overflow-hidden" aria-live="polite">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <li
                key={slide.id}
                data-active={isActive ? "true" : "false"}
                className={`carousel-slide size-full transition-opacity duration-700 ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!isActive}
              >
                <div className="relative size-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-cover"
                  />
                  {/* Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Caption */}
                  <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10 text-white pointer-events-none">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#299093] bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                      0{slide.id} — Production Telemetry
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold mt-2 text-white/95 drop-shadow-md">
                      {slide.title}
                    </h3>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Carousel Expandable Dot Navigation */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-12 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`View slide ${idx + 1}: ${slide.title}`}
                className="group relative flex items-center h-4 p-1 cursor-pointer focus:outline-none"
              >
                <span
                  className={`relative block h-3 rounded-full overflow-hidden transition-all duration-300 ${
                    isActive
                      ? "w-14 md:w-20 lg:w-28 bg-[#dbd7ca] dark:bg-white/20"
                      : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                >
                  {isActive && (
                    <span
                      className="block h-full bg-[#299093] rounded-full"
                      style={{
                        animation: "progressFill 5.5s linear forwards",
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
