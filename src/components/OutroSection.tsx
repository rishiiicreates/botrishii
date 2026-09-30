"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

export default function OutroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const ballRef = useRef<HTMLAnchorElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const leftRef = useRef<HTMLSpanElement | null>(null);
  const rightRef = useRef<HTMLSpanElement | null>(null);

  // Scroll Progress across section: offset ["start end", "end end"]
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  // Second half of scroll progress maps to 0 -> 1 (matching live site module 40937)
  const C = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const textTransform = useTransform(C, (v) => `translateY(${-105 * v}%)`);
  const leftY = useTransform(C, [0, 1], ["20%", "0%"]);
  const centerY = useTransform(C, [0, 1], ["50%", "0%"]);
  const rightY = useTransform(C, [0, 1], ["40%", "0%"]);

  // Attract cycle when user scrolls to bottom of section
  const [attractActive, setAttractActive] = useState(false);

  useMotionValueEvent(C, "change", (latest) => {
    if (typeof window === "undefined") return;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const prefersMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAttractActive(isFine && prefersMotion && latest >= 1);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const prefersMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isFine && prefersMotion && C.get() >= 1) {
      queueMicrotask(() => {
        setAttractActive(true);
      });
    }
  }, [C]);

  useEffect(() => {
    const btn = ballRef.current;
    const txt = textRef.current;
    if (!attractActive || !btn || !txt) return;

    let isHovered = false;
    let timerN = 0;
    let timerA = 0;
    let timerI = 0;

    const resetFans = () => {
      const fans = Array.from(btn.querySelectorAll<HTMLElement>(".reveal-fan"));
      fans.forEach((el) => {
        el.style.transition = "none";
        el.style.translate = "-102% 0";
        el.style.transform = "translateX(-102%)";
      });
      void btn.offsetWidth;
      fans.forEach((el) => {
        el.style.transition = "";
        el.style.translate = "";
        el.style.transform = "";
      });
    };

    const clearTimers = () => {
      window.clearTimeout(timerN);
      window.clearTimeout(timerA);
      window.clearTimeout(timerI);
    };

    const attract = () => {
      if (isHovered || btn.matches(":hover")) return;
      btn.classList.add("attract-in");
      timerA = window.setTimeout(() => {
        if (isHovered || btn.matches(":hover")) return;
        btn.classList.remove("attract-in");
        btn.classList.add("attract-out");
        timerI = window.setTimeout(() => {
          resetFans();
          scheduleAttract(1700);
        }, 900);
      }, 2900);
    };

    const scheduleAttract = (delay: number) => {
      window.clearTimeout(timerN);
      timerN = window.setTimeout(attract, delay);
    };

    const handleMouseEnter = () => {
      isHovered = true;
      clearTimers();
      btn.classList.remove("attract-in", "attract-out");
      resetFans();
    };

    const handleMouseLeave = () => {
      txt.style.translate = "";
      isHovered = false;
      btn.classList.remove("attract-in", "attract-out");
      scheduleAttract(2100);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) {
        isHovered = true;
        clearTimers();
        btn.classList.remove("attract-in", "attract-out");
      }
      const rect = btn.getBoundingClientRect();
      let x = e.clientX - (rect.left + rect.width / 2);
      let y = e.clientY - (rect.top + rect.height / 2);
      const maxDist = 0.13 * rect.width;
      const dist = Math.hypot(x, y);
      if (dist > maxDist) {
        x = (x / dist) * maxDist;
        y = (y / dist) * maxDist;
      }
      txt.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    };

    btn.addEventListener("mouseenter", handleMouseEnter);
    btn.addEventListener("mouseleave", handleMouseLeave);
    btn.addEventListener("mousemove", handleMouseMove, { passive: true });

    resetFans();
    scheduleAttract(1700);

    return () => {
      clearTimers();
      resetFans();
      btn.classList.remove("attract-in", "attract-out");
      btn.removeEventListener("mouseenter", handleMouseEnter);
      btn.removeEventListener("mouseleave", handleMouseLeave);
      btn.removeEventListener("mousemove", handleMouseMove);
    };
  }, [attractActive]);

  return (
    <section ref={sectionRef} className="tablet:h-[200svh] relative min-h-[160vh]">
      <div className="grid-pile px-gutter-outer tablet:sticky tablet:top-0 tablet:h-svh tablet:grid-rows-[minmax(0,1fr)] tablet:py-6 desktop:py-14 py-10 overflow-hidden">
        {/* Center Silhouette Geometry & Interactive Work Ball layered in the center */}
        <div className="flex justify-between w-columns-5/4 tablet:w-columns-10/9 desktop:w-columns-9/8 tablet:max-w-[calc((100svh-4.8rem)*5/4)] desktop:max-w-[calc((100svh-11.2rem)*5/4)] self-center justify-self-center relative z-0">
          {/* Left Pill: Solid White */}
          <motion.span
            ref={leftRef}
            className="aspect-2/5 w-[32%] rounded-full bg-white will-change-transform"
            style={{ y: leftY }}
            aria-hidden="true"
          />

          {/* Center Interactive Work Ball linking to /work */}
          <motion.div
            style={{ y: centerY }}
            className="mt-[9.6%] aspect-square w-[32%] self-start isolate will-change-transform flex items-center justify-center"
          >
            <Link
              ref={ballRef}
              href="/work"
              className="pong-ball group grid-pile max-tablet:pointer-coarse:bg-black @container size-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white [clip-path:circle(50%_at_50%_50%)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] [transform:translateZ(0)] isolate"
              aria-label="View Work"
            >
              {/* Inner clipping container for 100% WebKit/Safari boundary compliance */}
              <div className="size-full rounded-full overflow-hidden [clip-path:circle(50%_at_50%_50%)] [-webkit-mask-image:-webkit-radial-gradient(white,black)] [transform:translateZ(0)] grid-pile items-center pointer-events-none">
                {/* 4-Layer Radial Fan Hover Wipe */}
                <span
                  className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#299093] delay-0"
                  aria-hidden="true"
                />
                <span
                  className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#ef6156] delay-50"
                  aria-hidden="true"
                />
                <span
                  className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#ffbd00] delay-100"
                  aria-hidden="true"
                />
                <span
                  className="reveal-fan max-tablet:pointer-coarse:hidden pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#061a1e] delay-180"
                  aria-hidden="true"
                />

                <span
                  ref={textRef}
                  className="pong-play max-tablet:pointer-coarse:opacity-100 relative justify-self-center text-[25cqw] leading-none font-bold tracking-[-0.02em] text-white opacity-0 transition-opacity delay-300 duration-200 group-hover:opacity-100 motion-reduce:transition-none uppercase"
                >
                  Work
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Right Pill: Solid White */}
          <motion.span
            ref={rightRef}
            className="aspect-2/5 w-[32%] rounded-full bg-white will-change-transform"
            style={{ y: rightY }}
            aria-hidden="true"
          />
        </div>

        {/* Massive Poster Typography ("Get to know Rishii") layered as z-above-content */}
        <motion.p
          style={{ transform: textTransform }}
          className="text-poster tablet:flex z-above-content relative pointer-events-none hidden w-full flex-col justify-center gap-[0.15em] whitespace-nowrap self-center select-none text-[#061a1e]"
        >
          <span className="even:text-right">Get to</span>
          <span className="even:text-right">know</span>
          <span className="even:text-right">Rishii</span>
        </motion.p>
      </div>
    </section>
  );
}
