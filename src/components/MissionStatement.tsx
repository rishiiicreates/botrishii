"use client";

import React from "react";
import { ShieldCheck, Activity, Award, Sparkles } from "lucide-react";

export default function MissionStatement() {
  return (
    <section className="layout-grid py-28 md:py-40 gap-y-16 items-start border-b border-black/10 dark:border-white/10">
      {/* Manifesto Headline */}
      <div className="col-span-full">
        <h2 className="flex flex-col gap-2 max-w-4xl">
          {/* Line 1: [Dot] + The work we + always imagined */}
          <span className="flex flex-wrap items-center gap-3">
            <span className="h-16 md:h-24 lg:h-28 aspect-square rounded-full bg-[#ef6156] shrink-0" />
            <span className="grid-pile-inline h-16 md:h-24 lg:h-28 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-[#ef6156] text-black font-bold">
                The work we
              </span>
            </span>
            <span className="grid-pile-inline h-16 md:h-24 lg:h-28 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-[#061a1e] dark:bg-[#0a2228] text-white font-bold border border-white/10">
                always imagined
              </span>
            </span>
          </span>

          {/* Line 2: machines could do */}
          <span className="flex mt-1">
            <span className="grid-pile-inline h-16 md:h-24 lg:h-28 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
              <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-white text-black font-bold shadow-sm">
                machines could do
              </span>
            </span>
          </span>
        </h2>
      </div>

      {/* Manifesto Narrative & Principles Grid */}
      <div className="col-span-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Main Manifesto Copy */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-paragraph-large opacity-90 leading-relaxed font-normal">
          <p className="text-2xl md:text-3xl font-medium tracking-tight leading-snug">
            <strong className="font-bold text-current">Our robots take on</strong> the intricate,
            often grueling work the world actually runs on, not the rigid, perfectly predictable
            motions that classical automation has already solved.
          </p>
          <p>
            By focusing on skills that require more reasoning, variability, and dexterity, Mind
            robots can finally help with tasks that have always depended on human hands.
          </p>
          <p className="text-xl md:text-2xl font-semibold text-[#299093]">
            Our aim is to make manufacturing safer, more efficient, and more globally competitive by
            augmenting human capability.
          </p>
        </div>

        {/* Industrial Principle Pillars */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-6 rounded-[2rem] bg-[#0a1e23] border border-white/10 text-white flex items-start gap-4 shadow-sm">
            <div className="size-10 rounded-xl bg-[#299093]/20 text-[#299093] flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Workplace Safety First</h4>
              <p className="text-sm text-white/75 mt-1">
                Absorbing high-strain, ergonomic injury risks and repetitive stress cycles on live lines.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-[#0a1e23] border border-white/10 text-white flex items-start gap-4 shadow-sm">
            <div className="size-10 rounded-xl bg-[#ffbd00]/20 text-[#ffbd00] flex items-center justify-center shrink-0">
              <Activity className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Continuous Generalization</h4>
              <p className="text-sm text-white/75 mt-1">
                Zero re-programming downtime across batch variances, orientation shifts, and new SKUs.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-[#0a1e23] border border-white/10 text-white flex items-start gap-4 shadow-sm">
            <div className="size-10 rounded-xl bg-[#ef6156]/20 text-[#ef6156] flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">Human Collaborative Augmentation</h4>
              <p className="text-sm text-white/75 mt-1">
                Engineered to share floor space alongside existing operators with reactive safety margins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
