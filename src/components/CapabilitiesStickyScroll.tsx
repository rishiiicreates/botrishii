"use client";

import React, { useState, useEffect, useRef } from "react";
import FactoryFloor3D from "./FactoryFloor3D";

const STATIONS = [
  {
    id: "pick-and-place",
    title: "Find the itch",
    description:
      "Spotting the task everyone dreads, the one that eats hours and somehow gets done differently by every person.",
  },
  {
    id: "sorting",
    title: "Build it small",
    description:
      "Shipping the smallest version that works first, before anyone can suggest adding a chatbot to it.",
  },
  {
    id: "fastening",
    title: "Break it on purpose",
    description:
      "Feeding it messy inputs, weird formats, and every edge case I can think of, so real life doesn't get to do it first.",
  },
  {
    id: "connectors",
    title: "Hand over the keys",
    description:
      "Making it dull and dependable, so it runs without me and nobody has to ask what it does at 2am.",
  },
];

export default function CapabilitiesStickyScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStationIndex, setActiveStationIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const current = -rect.top;
      const p = Math.min(Math.max(current / totalScrollable, 0), 1);
      setScrollProgress(p);

      const stationIdx = Math.min(Math.floor(p * STATIONS.length), STATIONS.length - 1);
      setActiveStationIndex(stationIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToStation = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const totalScrollable = container.offsetHeight - window.innerHeight;
    const targetScroll = container.offsetTop + (index / (STATIONS.length - 1)) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="bg-[#dbd7ca] dark:bg-[#081a1e] relative h-[400lvh] border-t border-[#d3d0c5] dark:border-white/10"
    >
      <div className="grid-pile sticky top-0 h-lvh w-full overflow-clip">
        {/* 3D Isometric Interactive Canvas */}
        <FactoryFloor3D
          scrollProgress={scrollProgress}
          onStationChange={setActiveStationIndex}
        />

        {/* Grid Overlay with Headline at Top and Floating Capability Card at Bottom-Right */}
        <div className="layout-grid pb-gutter-outer tablet:gap-y-20 relative h-full content-between gap-y-12 pt-[var(--header-height)] pointer-events-none">
          {/* Top-Left Headline */}
          <h2 className="col-span-full select-none">
            <span className="tablet:gap-1.5 laptop:gap-2 flex flex-col gap-1">
              {/* Line 1: [Teal Pill: My process,] */}
              <span className="flex flex-wrap gap-[inherit]">
                <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full whitespace-nowrap text-heading-2">
                  <span className="tag-fan-layer flex h-full items-center px-[var(--tag-padding-inline)] bg-[#299093] text-white font-bold leading-none">
                    My process,
                  </span>
                </span>
              </span>

              {/* Line 2: [White Dot] + [White pill: minus the buzzwords] */}
              <span className="flex flex-wrap gap-[inherit]">
                <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full aspect-square">
                  <span className="tag-fan-layer flex h-full items-center leading-none self-stretch bg-white" />
                </span>
                <span className="grid-pile-inline h-[4rem] tablet:h-[6rem] laptop:h-[8rem] overflow-hidden rounded-full whitespace-nowrap text-heading-2">
                  <span className="tag-fan-layer flex h-full items-center px-[var(--tag-padding-inline)] bg-white text-[#061a1e] font-bold leading-none">
                    minus the buzzwords
                  </span>
                </span>
              </span>
            </span>
          </h2>

          {/* Bottom-Right Floating Telemetry Capability Card */}
          <div
            aria-live="polite"
            className="tablet:max-w-[40rem] rounded-[2.4rem] col-span-full flex w-full flex-col gap-8 justify-self-end bg-white p-8 pointer-events-auto text-[#061a1e]"
          >
            <div className="grid-pile">
              {STATIONS.map((stn, idx) => {
                const isActive = idx === activeStationIndex;
                return (
                  <div
                    key={stn.id}
                    data-is-active={isActive ? "true" : "false"}
                    className={`tablet:gap-6 flex flex-col gap-4 transition-[opacity,visibility] duration-200 ease-in-out ${
                      isActive ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
                    }`}
                  >
                    <h3 className="text-heading-4 text-[#061a1e]">{stn.title}</h3>
                    <div className="text-paragraph-medium text-[#061a1e]">
                      <p>{stn.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4-Dot Pill Indicator Bar */}
            <ul className="flex gap-2 items-center">
              {STATIONS.map((stn, idx) => {
                const isActive = idx === activeStationIndex;
                const isBeforeActive = idx < activeStationIndex;
                return (
                  <li key={stn.id}>
                    <button
                      type="button"
                      onClick={() => scrollToStation(idx)}
                      aria-label={`Show ${stn.title}`}
                      className="group relative flex cursor-pointer items-center py-2"
                    >
                      <span
                        className={`h-3 rounded-full overflow-hidden transition-[width,background-color] duration-200 ease-in-out ${
                          isActive
                            ? "w-16 tablet:w-20 laptop:w-31 bg-[#299093]"
                            : isBeforeActive
                            ? "w-3 bg-[#299093]"
                            : "w-3 bg-[#dbd7ca] group-hover:bg-[#b8b3a5]"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
