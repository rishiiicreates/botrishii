"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: "Off-the-shelf models hallucinating out-of-scope",
    src: "/images/work-model-failure-modes.png",
    alt: "Why off-the-shelf models fail curriculum constraints",
  },
  {
    id: 2,
    title: "Automated pipeline ingesting 95k+ vector chunks",
    src: "/images/work-corpus-scale.png",
    alt: "Automated ingestion pipeline parsing 943 official resources",
  },
  {
    id: 3,
    title: "Production scorecard: 100% verified & zero hallucination",
    src: "/images/work-production-scorecard.png",
    alt: "Final engineering scorecard with verified citations and sub-500ms streaming",
  },
];

export default function CapabilitiesCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      className="grid-pile aspect-[16/9] max-h-[820px] relative w-full overflow-hidden bg-[#fbf8ee] dark:bg-[#071b1f] border-y border-black/10 dark:border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ol className="grid-pile size-full overflow-hidden" aria-live="polite">
        {CAROUSEL_SLIDES.map((slide, idx) => {
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
              <div className="relative size-full bg-[#fbf8ee] dark:bg-[#071b1f]">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  unoptimized
                  sizes="100vw"
                  className="object-contain"
                />

                {/* Clean Floating Frosted Badge & Caption */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 z-10 pointer-events-none flex flex-col items-start gap-1.5 max-w-[85%] sm:max-w-[70%]">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#299093] dark:text-[#52d2d6] bg-[#061a1e]/85 text-white px-3 py-1 rounded-full backdrop-blur-md border border-white/15 shadow-sm">
                    0{slide.id} — Engineering Pipeline
                  </span>
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-[#061a1e] dark:text-white bg-white/90 dark:bg-[#061a1e]/90 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-black/10 dark:border-white/10 shadow-md">
                    {slide.title}
                  </h3>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Expandable Pill Indicator Bar */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-20 flex items-center gap-2 bg-[#061a1e]/70 dark:bg-black/70 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-white/15 shadow-md">
        {CAROUSEL_SLIDES.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(idx)}
              aria-label={`View slide ${idx + 1}`}
              className="group relative flex items-center h-4 p-1 cursor-pointer focus:outline-none"
            >
              <span
                className={`relative block h-2.5 sm:h-3 rounded-full overflow-hidden transition-all duration-300 ${
                  isActive
                    ? "w-10 sm:w-16 md:w-24 bg-white/30"
                    : "w-2.5 sm:w-3 bg-white/40 hover:bg-white/70"
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
  );
}
