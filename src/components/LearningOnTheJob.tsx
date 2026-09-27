"use client";

import React from "react";
import Image from "next/image";

export default function LearningOnTheJob() {
  return (
    <section className="layout-grid py-24 md:py-36 gap-y-12 items-start border-b border-black/10 dark:border-white/10">
      {/* Left Column: Heading and Narrative */}
      <div className="col-span-full lg:col-span-6 flex flex-col gap-8 md:gap-12">
        {/* Headline with Pill Badges */}
        <h2 className="flex flex-col gap-2 max-w-xl">
          {/* Line 1: Our first robots are */}
          <span className="flex">
            <span className="grid-pile-inline h-16 md:h-24 lg:h-28 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-[#061a1e] dark:bg-[#0a2228] text-white font-bold border border-white/10">
                Our first robots are
              </span>
            </span>
          </span>

          {/* Line 2: [Yellow Dot] + [Terracotta: learning on the job] */}
          <span className="flex items-center gap-3">
            <span className="h-16 md:h-24 lg:h-28 aspect-square rounded-full bg-[#ffbd00] shrink-0" />
            <span className="grid-pile-inline h-16 md:h-24 lg:h-28 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-[#ef6156] text-black font-bold">
                learning on the job
              </span>
            </span>
          </span>
        </h2>

        {/* Narrative Copy */}
        <div className="flex flex-col gap-6 text-paragraph-large opacity-90 max-w-xl font-normal leading-relaxed">
          <p>
            <strong className="font-bold text-current">With Rivian</strong> as our first
            manufacturing partner, we&apos;re building a rich dataset inside a live production
            facility and training on active vehicle lines. Our data pipeline is centered on learning
            from skilled operators as they perform highly dexterous tasks, distilling the actions,
            tools, context, and decisions that make each cycle successful.
          </p>
          <p>
            Mind&apos;s live dataset gives our models a deep understanding of real-world physics,
            variance, and material behavior. By mastering diverse automotive tasks first, we&apos;re
            building capabilities that transfer across all of industrial manufacturing.
          </p>
        </div>
      </div>

      {/* Right Column: Supporting Factory Hardware Photo */}
      <div className="col-span-full lg:col-span-6 lg:col-start-7 flex justify-center lg:justify-end">
        <figure className="relative w-full aspect-[755/503] max-w-2xl rounded-[2.5rem] md:rounded-[3.2rem] overflow-hidden border border-black/10 dark:border-white/15 bg-black/10 dark:bg-white/5 shadow-2xl group">
          <Image
            src="/images/robots-learning.png"
            alt="Mind Robotics hardware learning dexterous automotive assembly inside Rivian production plant"
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Telemetry Badge */}
          <div className="absolute bottom-6 left-6 z-10 text-white font-mono text-xs flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#ffbd00] animate-pulse" />
            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              Live Partner Facility — Active Cycle Telemetry
            </span>
          </div>
        </figure>
      </div>
    </section>
  );
}
