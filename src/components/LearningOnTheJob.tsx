"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import FanTag from "./FanTag";

export default function LearningOnTheJob() {
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
    <section className="layout-grid laptop:grid-rows-[auto_1fr] py-[9.6rem] tablet:py-[11.2rem] laptop:py-[20rem]">
      {/* Left Column: Heading (Row 1) */}
      <h2
        ref={headingRef}
        aria-label="Our first robots are learning on the job"
        className="laptop:col-span-6 laptop:row-start-1 col-span-full max-w-[70rem]"
      >
        <span className="tablet:gap-1.5 laptop:gap-2 flex flex-col gap-1">
          {/* Line 1: Our first robots are */}
          <span className="flex flex-wrap gap-[inherit]">
            <FanTag
              text="Our first robots are"
              color="#061a1e"
              textColor="text-white"
              size="medium"
              canReveal={canReveal}
              delay={0}
            />
          </span>

          {/* Line 2: [Yellow Circle] + [Coral: learning on the job] */}
          <span className="flex flex-wrap gap-[inherit]">
            <FanTag
              color="#ffbd00"
              size="medium"
              canReveal={canReveal}
              delay={0.2}
            />
            <FanTag
              text="learning on the job"
              color="#ef6156"
              textColor="text-[#061a1e]"
              size="medium"
              canReveal={canReveal}
              delay={0.35}
            />
          </span>
        </span>
      </h2>

      {/* Left Column: Narrative Copy (Row 2) */}
      <div className="text-paragraph-large tablet:col-span-8 tablet:mt-16 laptop:col-span-5 laptop:row-start-2 laptop:self-start laptop:max-w-[60rem] col-span-6 col-start-1 mt-12">
        <p>
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

      {/* Right Column: Supporting Rivian Photography */}
      <figure className="asset-container tablet:col-span-10 tablet:col-start-3 tablet:mt-24 laptop:col-span-6 laptop:col-start-7 laptop:row-span-full laptop:mt-0 laptop:self-start rounded-[4rem] col-span-6 col-start-1 mt-20 overflow-hidden aspect-[755/503] relative">
        <Image
          src="/images/robots-learning.png"
          alt="Mind Robotics hardware learning dexterous automotive assembly inside Rivian production plant"
          fill
          priority
          unoptimized
          sizes="(min-width: 1280px) 47vw, (min-width: 768px) 76vw, 88vw"
          className="object-cover"
        />
      </figure>
    </section>
  );
}
