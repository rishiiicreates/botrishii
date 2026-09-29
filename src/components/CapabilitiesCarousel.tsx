"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const CAROUSEL_SLIDES = [
  {
    id: 1,
    title: "The workflow, as documented",
    src: "/images/cap-carousel-1.png",
    alt: "The workflow, as documented",
  },
  {
    id: 2,
    title: "The workflow, as it actually is",
    src: "/images/cap-carousel-2.png",
    alt: "The workflow, as it actually is",
  },
  {
    id: 3,
    title: "The workflow, after I'm done",
    src: "/images/cap-carousel-3.png",
    alt: "The workflow, after I'm done",
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
      className="grid-pile aspect-2/1 relative w-full overflow-hidden bg-black/40 border-y border-black/10 dark:border-white/10"
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
              <div className="relative size-full">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  unoptimized
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Expandable Pill Indicator Bar */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-12 z-20 flex items-center gap-2">
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
  );
}
