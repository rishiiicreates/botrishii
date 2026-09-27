"use client";

import React from "react";
import dynamic from "next/dynamic";

const MissionHand3D = dynamic(() => import("./MissionHand3D"), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

export default function MissionStatement() {
  return (
    <section className="layout-grid laptop:grid-rows-[auto_1fr] py-[9.6rem] tablet:py-[11.2rem] laptop:py-[20rem] items-start relative z-20 overflow-visible">
      {/* Left Column: Heading (Row 1) */}
      <h2 className="laptop:col-span-6 laptop:row-start-1 col-span-full max-w-[70rem]">
        <span className="tablet:gap-1.5 laptop:gap-2 flex flex-col gap-1">
          {/* Line 1: [Coral Dot] + [Coral Pill: The work we] + [Dark Pill: always imagined] */}
          <span className="flex flex-wrap gap-[inherit]">
            <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full aspect-square">
              <span className="flex h-full items-center leading-none self-stretch bg-[#ef6156]" />
            </span>
            <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="flex h-full items-center leading-none px-[var(--tag-padding-inline)] self-stretch bg-[#ef6156] text-[#061a1e]">
                The work we
              </span>
            </span>
            <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="flex h-full items-center leading-none px-[var(--tag-padding-inline)] self-stretch bg-[#061a1e] text-white">
                always imagined
              </span>
            </span>
          </span>

          {/* Line 2: [White Pill: machines could do] */}
          <span className="flex flex-wrap gap-[inherit]">
            <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="flex h-full items-center leading-none px-[var(--tag-padding-inline)] self-stretch bg-white text-[#061a1e]">
                machines could do
              </span>
            </span>
          </span>
        </span>
      </h2>

      {/* Left Column: Narrative Copy (Row 2) */}
      <div className="text-paragraph-large tablet:col-span-8 tablet:mt-16 laptop:col-span-5 laptop:row-start-2 laptop:self-start laptop:max-w-[60rem] col-span-6 col-start-1 mt-12">
        <p>
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

      {/* Right Column: 3D Cel-Shaded Robotic Hand Card */}
      <div className="bg-[#dbd7ca] rounded-[4rem] tablet:col-span-10 tablet:col-start-3 tablet:mt-24 laptop:col-span-6 laptop:col-start-7 laptop:row-span-full laptop:mt-0 laptop:self-start z-20 relative col-span-5 col-start-2 mt-20 aspect-[19/20] border border-black overflow-visible">
        {/* Spill Container: exact live site formula allowing hand to extend naturally into surrounding columns without being clipped */}
        <div className="laptop:[--spill:calc(var(--single-column-width-with-gutter-inner)*3)] tablet:[--spill:calc(var(--single-column-width-with-gutter-inner)*2)] pointer-events-none absolute top-0 right-0 -bottom-[var(--spill)] -left-[var(--spill)] [--spill:var(--single-column-width-with-gutter-inner)] [clip-path:inset(0_round_0_var(--radius-medium)_0_0)] overflow-visible">
          <MissionHand3D />
        </div>
      </div>
    </section>
  );
}
