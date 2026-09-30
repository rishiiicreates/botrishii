"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const MotionLink = motion.create(Link);

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

  // Second half of scroll progress maps to 0 -> 1 (matching reference site module 40937)
  const C = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
  const textTransform = useTransform(C, (v) => `translateY(${4 + 8 * v}%)`);
  const leftY = useTransform(C, [0, 1], ["20%", "0%"]);
  const centerY = useTransform(C, [0, 1], ["50%", "0%"]);
  const rightY = useTransform(C, [0, 1], ["40%", "0%"]);

  // Magnetic cursor interaction for the Work label inside the ball
  useEffect(() => {
    const btn = ballRef.current;
    const txt = textRef.current;
    if (!btn || !txt) return;

    const handleMouseMove = (e: MouseEvent) => {
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

    const handleMouseLeave = () => {
      txt.style.translate = "";
    };

    btn.addEventListener("mousemove", handleMouseMove, { passive: true });
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="tablet:h-[200svh] relative">
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
          <MotionLink
            ref={ballRef}
            href="/work"
            style={{ y: centerY }}
            className="pong-ball group grid-pile @container mt-[9.6%] aspect-square w-[32%] cursor-pointer items-center self-start overflow-hidden rounded-full bg-white [clip-path:circle(50%_at_50%_50%)] will-change-transform relative z-10 isolate"
            aria-label="View Work"
          >
            {/* 4-Layer Radial Fan Hover Wipe */}
            <span
              className="reveal-fan pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#299093] delay-0"
              aria-hidden="true"
            />
            <span
              className="reveal-fan pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#ef6156] delay-50"
              aria-hidden="true"
            />
            <span
              className="reveal-fan pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#ffbd00] delay-100"
              aria-hidden="true"
            />
            <span
              className="reveal-fan pointer-events-none size-full -translate-x-[102%] rounded-full transition-transform duration-600 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none bg-[#061a1e] delay-180"
              aria-hidden="true"
            />

            <span
              ref={textRef}
              className="pong-play pointer-events-none relative justify-self-center text-[25cqw] leading-none font-bold tracking-[-0.02em] text-white opacity-0 transition-opacity delay-300 duration-200 group-hover:opacity-100 motion-reduce:transition-none"
            >
              Work
            </span>
          </MotionLink>

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
