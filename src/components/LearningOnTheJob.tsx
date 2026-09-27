"use client";

import React from "react";
import Image from "next/image";

export default function LearningOnTheJob() {
  return (
    <section className="layout-grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] py-20 md:py-32 items-start border-b border-black/10 dark:border-white/10">
      {/* Left Column: Heading (Row 1) */}
      <h2 className="col-span-full lg:col-span-6 lg:row-start-1 max-w-[70rem]">
        <span className="flex flex-col gap-2 md:gap-3">
          {/* Line 1: Our first robots are */}
          <span className="flex flex-wrap gap-2">
            <span className="inline-flex h-[4.4rem] sm:h-[6.2rem] lg:h-[8rem] w-fit rounded-full bg-[#061a1e] text-white items-center px-[2rem] sm:px-[2.8rem] lg:px-[3.6rem] whitespace-nowrap text-[2.4rem] sm:text-[3.8rem] lg:text-[5.6rem] font-bold tracking-tight shadow-sm shrink-0">
              Our first robots are
            </span>
          </span>

          {/* Line 2: [Yellow Circle] + [Coral: learning on the job] */}
          <span className="flex items-center gap-2 md:gap-3 flex-wrap">
            <span className="h-[4.4rem] sm:h-[6.2rem] lg:h-[8rem] aspect-square rounded-full bg-[#ffbd00] shrink-0" />
            <span className="inline-flex h-[4.4rem] sm:h-[6.2rem] lg:h-[8rem] w-fit rounded-full bg-[#ef6156] text-[#061a1e] items-center px-[2rem] sm:px-[2.8rem] lg:px-[3.6rem] whitespace-nowrap text-[2.4rem] sm:text-[3.8rem] lg:text-[5.6rem] font-bold tracking-tight shrink-0">
              learning on the job
            </span>
          </span>
        </span>
      </h2>

      {/* Left Column: Narrative Copy (Row 2) */}
      <div className="text-[1.8rem] sm:text-[2rem] leading-[1.5] text-[#061a1e] col-span-full lg:col-span-5 lg:row-start-2 lg:self-start max-w-[60rem] mt-10">
        <p className="mb-6">
          <strong className="font-bold">With Rivian</strong> as our first manufacturing partner,
          we&apos;re building a rich dataset inside a live production facility and training on
          active vehicle lines. Our data pipeline is centered on learning from skilled operators as
          they perform highly dexterous tasks, distilling the actions, tools, context, and decisions
          that make each cycle successful.
        </p>
        <p>
          Mind&apos;s live dataset gives our models a deep understanding of real-world physics,
          variance, and material behavior. By mastering diverse automotive tasks first, we&apos;re
          building capabilities that transfer across all of industrial manufacturing.
        </p>
      </div>

      {/* Right Column: Supporting Rivian Photography (Row span 2 starting at row 1) */}
      <figure className="col-span-full lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-start lg:mt-0 mt-14 rounded-[3.2rem] lg:rounded-[4rem] overflow-hidden aspect-[755/503] relative border border-black/10 shadow-lg">
        <Image
          src="/images/robots-learning.png"
          alt="Mind Robotics hardware learning dexterous automotive assembly inside Rivian production plant"
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </figure>
    </section>
  );
}
