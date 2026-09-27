"use client";

import React, { useState } from "react";
import { Play, X, ExternalLink } from "lucide-react";

const DEPARTMENTS = [
  "Research and modeling",
  "ML infrastructure",
  "Hardware",
  "Engineering and design",
  "Data",
  "Robotics software",
  "Application Engineer",
];

export default function CareersSection() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="layout-grid py-[20rem] gap-y-16 items-center border-b border-black/10 dark:border-white/10 relative z-10 overflow-visible">
      {/* Centered Heading with Pill Fan Tags */}
      <div className="col-span-full flex justify-center text-center">
        <h2 className="text-heading-1 tracking-tight max-w-4xl text-balance">
          {/* Tag: Hands on */}
          <span className="grid-pile-inline h-[1.3em] overflow-hidden rounded-full align-middle mr-2.5">
            <span className="bg-[#dbd7ca] dark:bg-[#11282d] rounded-full tag-base-reveal" />
            <span
              className="tag-fan-layer rounded-full bg-[#299093]"
              style={{ "--index": 0, "--delay": "0s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#ef6156]"
              style={{ "--index": 1, "--delay": "0s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#ffbd00] flex items-center px-4 md:px-6 text-black font-bold"
              style={{ "--index": 2, "--delay": "0s" } as React.CSSProperties}
            >
              Hands on
            </span>
          </span>

          <span className="headline-word mr-3" style={{ "--delay": "0.2s" } as React.CSSProperties}>
            with
          </span>
          <span className="headline-word mr-3" style={{ "--delay": "0.35s" } as React.CSSProperties}>
            hardware
          </span>

          {/* Tag: every day */}
          <span className="grid-pile-inline h-[1.3em] overflow-hidden rounded-full align-middle">
            <span className="bg-[#dbd7ca] dark:bg-[#11282d] rounded-full tag-base-reveal" />
            <span
              className="tag-fan-layer rounded-full bg-[#ffbd00]"
              style={{ "--index": 0, "--delay": "0.5s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#299093]"
              style={{ "--index": 1, "--delay": "0.5s" } as React.CSSProperties}
            />
            <span
              className="tag-fan-layer rounded-full bg-[#8f8c83] flex items-center px-4 md:px-6 text-black font-bold"
              style={{ "--index": 2, "--delay": "0.5s" } as React.CSSProperties}
            >
              every day
            </span>
          </span>
        </h2>
      </div>

      {/* Flagship Careers Card */}
      <div className="col-span-full lg:col-span-10 lg:col-start-2 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 bg-[#0a1e23] p-8 md:p-14 lg:p-20 shadow-xl flex flex-col lg:flex-row gap-12 lg:gap-20 items-start text-white">
        {/* Left Subhead */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.2] text-white">
            What you build on the bench today changes how factories run tomorrow.
          </h3>

          {/* Embedded Video Workbench Preview */}
          <div className="relative mt-4 w-full aspect-video rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group cursor-pointer"
               onClick={() => setVideoOpen(true)}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#299093]/20 via-transparent to-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="size-16 rounded-full bg-white dark:bg-[#061a1e] text-[#299093] flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <Play className="size-7 fill-current ml-1" />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-white/80 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                Bench Prototype Feed (0:48)
              </span>
            </div>
          </div>
        </div>

        {/* Right Content & Roles */}
        <div className="lg:w-1/2 flex flex-col gap-10">
          <div className="flex flex-col gap-6 text-paragraph-large opacity-90 leading-relaxed font-normal">
            <p>
              At Mind, we believe that being hands on with hardware can solve the hardest problems in
              AI.
            </p>
            <p>
              Mind offers the agility of a startup with the resources, data, and built-in customer
              base of an industrial pioneer. Join us if you value ownership, humility, and want to
              move beyond digital intelligence to put code into motion.
            </p>
          </div>

          {/* Department Chips */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider font-mono opacity-50">
              Open Practice Areas
            </span>
            <ul className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <li key={dept}>
                  <span className="inline-flex items-center h-8 px-4 rounded-full text-chip bg-black/5 dark:bg-white/10 hover:bg-[#299093]/15 hover:text-[#299093] transition-colors border border-black/5 dark:border-white/5 font-medium">
                    {dept}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <a
              href="https://jobs.ashbyhq.com/mindrobotics"
              target="_blank"
              rel="noopener noreferrer"
              className="group grid-pile h-12 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.5rem] font-bold shadow-lg"
            >
              <span
                className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#ef6156]"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#ffbd00] delay-[50ms]"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#061a1e] delay-[120ms]"
                aria-hidden="true"
              />
              <span className="relative z-10 px-8 flex items-center gap-2">
                <span>See open roles</span>
                <ExternalLink className="size-4 opacity-75" />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Video Modal Preview */}
      {videoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-white">
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="size-2 rounded-full bg-[#ef6156] animate-ping" />
                <span>Mind Robotics — Active Hardware Telemetry</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                className="size-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 aspect-video rounded-2xl overflow-hidden bg-[#061417] flex flex-col items-center justify-center text-center p-8 border border-white/10">
              <div className="size-20 rounded-full bg-[#299093]/20 text-[#299093] flex items-center justify-center mb-4">
                <Play className="size-10 fill-current ml-1" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Bench Calibration & Tool Manipulation
              </h4>
              <p className="text-sm text-white/70 max-w-md">
                Continuous hardware loop verification recorded inside our Palo Alto research laboratory.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
