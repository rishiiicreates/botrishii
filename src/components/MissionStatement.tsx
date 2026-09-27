"use client";

import React from "react";
import dynamic from "next/dynamic";

const MissionHand3D = dynamic(() => import("./MissionHand3D"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

export default function MissionStatement() {
  return (
    <section className="layout-grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] py-[20rem] items-start relative z-20 overflow-visible">
      {/* Left Column: Heading (Row 1) */}
      <h2 className="col-span-full lg:col-span-6 lg:row-start-1 max-w-[70rem]">
        <span className="flex flex-col gap-2 md:gap-3">
          {/* Line 1: [Coral Pill: The work we] */}
          <span className="flex flex-wrap gap-2">
            <span className="inline-flex h-[4.4rem] sm:h-[6.2rem] lg:h-[8rem] w-fit rounded-full bg-[#ef6156] text-[#061a1e] items-center px-[2rem] sm:px-[2.8rem] lg:px-[3.6rem] whitespace-nowrap text-[2.4rem] sm:text-[3.8rem] lg:text-[5.6rem] font-bold tracking-tight shrink-0">
              The work we
            </span>
          </span>

          {/* Line 2: [Dark Pill: always imagined] */}
          <span className="flex flex-wrap gap-2">
            <span className="inline-flex h-[4.4rem] sm:h-[6.2rem] lg:h-[8rem] w-fit rounded-full bg-[#061a1e] text-white items-center px-[2rem] sm:px-[2.8rem] lg:px-[3.6rem] whitespace-nowrap text-[2.4rem] sm:text-[3.8rem] lg:text-[5.6rem] font-bold tracking-tight shrink-0 shadow-sm">
              always imagined
            </span>
          </span>

          {/* Line 3: [White Pill: machines could do] */}
          <span className="flex flex-wrap gap-2">
            <span className="inline-flex h-[4.4rem] sm:h-[6.2rem] lg:h-[8rem] w-fit rounded-full bg-white text-[#061a1e] items-center px-[2rem] sm:px-[2.8rem] lg:px-[3.6rem] whitespace-nowrap text-[2.4rem] sm:text-[3.8rem] lg:text-[5.6rem] font-bold tracking-tight shrink-0 shadow-sm border border-black/5">
              machines could do
            </span>
          </span>
        </span>
      </h2>

      {/* Left Column: Narrative Copy (Row 2) */}
      <div className="text-[1.8rem] sm:text-[2rem] leading-[1.5] text-[#061a1e] col-span-full lg:col-span-5 lg:row-start-2 lg:self-start max-w-[60rem] mt-10">
        <p className="mb-6">
          <strong className="font-bold">Our robots take on</strong> the intricate, often grueling
          work the world actually runs on, not the rigid, perfectly predictable motions that
          classical automation has already solved. By focusing on skills that require more reasoning,
          variability, and dexterity, Mind robots can finally help with tasks that have always
          depended on human hands.
        </p>
        <p>
          Our aim is to make manufacturing safer, more efficient, and more globally competitive by
          augmenting human capability.
        </p>
      </div>

      {/* Right Column: 3D Cel-Shaded Robotic Hand Card (Row span 2 starting at row 1) */}
      <div className="bg-[#dbd7ca] rounded-[3.2rem] lg:rounded-[4rem] border border-[#061a1e] relative aspect-[19/20] col-span-full lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-start lg:mt-0 mt-14 z-20 overflow-visible">
        {/* Spill Container: extends down and left to let the hand fingers spill naturally without being clipped */}
        <div className="pointer-events-none absolute top-0 right-0 -bottom-[38rem] lg:-bottom-[46rem] -left-[32rem] lg:-left-[40rem] [clip-path:inset(0_round_0_3.2rem_0_0)] lg:[clip-path:inset(0_round_0_4rem_0_0)] overflow-visible">
          <MissionHand3D />
        </div>
      </div>
    </section>
  );
}
