"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import FanTag from "./FanTag";

const MissionHand3D = dynamic(() => import("./MissionHand3D"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

export default function MissionStatement() {
  const [canReveal, setCanReveal] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanReveal(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="layout-grid laptop:grid-rows-[auto_1fr] py-[9.6rem] tablet:py-[11.2rem] laptop:py-[20rem] items-start relative z-20 overflow-visible">
      {/* Left Column: Heading (Row 1) */}
      <h2
        ref={headingRef}
        aria-label="The work I always wished software could do"
        className="laptop:col-span-6 laptop:row-start-1 col-span-full max-w-[70rem]"
      >
        <span className="tablet:gap-1.5 laptop:gap-2 flex flex-col gap-1">
          {/* Line 1: [Coral Dot] + [Coral Pill: The work I] + [Dark Pill: always wished] */}
          <span className="flex flex-wrap gap-[inherit]">
            <FanTag
              color="#ef6156"
              size="medium"
              canReveal={canReveal}
              delay={0}
            />
            <FanTag
              text="The work I"
              color="#ef6156"
              textColor="text-[#061a1e]"
              size="medium"
              canReveal={canReveal}
              delay={0.15}
            />
            <FanTag
              text="always wished"
              color="#061a1e"
              textColor="text-white"
              size="medium"
              canReveal={canReveal}
              delay={0.3}
            />
          </span>

          {/* Line 2: [White Pill: software could do] */}
          <span className="flex flex-wrap gap-[inherit]">
            <FanTag
              text="software could do"
              color="#ffffff"
              textColor="text-[#061a1e]"
              size="medium"
              canReveal={canReveal}
              delay={0.45}
            />
          </span>
        </span>
      </h2>

      {/* Left Column: Narrative Copy (Row 2) */}
      <div className="text-paragraph-large tablet:col-span-8 tablet:mt-16 laptop:col-span-5 laptop:row-start-2 laptop:self-start laptop:max-w-[60rem] col-span-6 col-start-1 mt-12">
        <p>
          <strong className="font-bold">I go after</strong> the repetitive, error-prone
          work that quietly eats a team&apos;s week, not the simple rule-based tasks old tools
          already handle. Anything that needs context, judgment, and a little adaptability is
          fair game. If a human keeps saying &apos;ugh, this again,&apos; it&apos;s on my list.
        </p>
        <p>
          My aim is simple: small teams that feel bigger, because the busywork disappeared and
          the interesting decisions stayed human.
        </p>
      </div>

      {/* Right Column: 3D Cel-Shaded Hand Card */}
      <div className="bg-[#dbd7ca] rounded-[4rem] tablet:col-span-10 tablet:col-start-3 tablet:mt-24 laptop:col-span-6 laptop:col-start-7 laptop:row-span-full laptop:mt-0 laptop:self-start z-20 relative col-span-5 col-start-2 mt-20 aspect-[19/20] border border-black overflow-visible">
        {/* Spill Container: exact live site formula allowing hand to extend naturally into surrounding columns without being clipped */}
        <div className="laptop:[--spill:calc(var(--single-column-width-with-gutter-inner)*3)] tablet:[--spill:calc(var(--single-column-width-with-gutter-inner)*2)] pointer-events-none absolute top-0 right-0 -bottom-[var(--spill)] -left-[var(--spill)] [--spill:var(--single-column-width-with-gutter-inner)] [clip-path:inset(0_round_0_var(--radius-medium)_0_0)] overflow-visible">
          <MissionHand3D />
        </div>
      </div>
    </section>
  );
}
