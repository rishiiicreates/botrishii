"use client";

import React, { useState, useEffect, useRef } from "react";
import FactoryFloor3D from "./FactoryFloor3D";

const STATIONS = [
  {
    id: "pick-and-place",
    title: "Pick and place",
    description:
      "Locating, grasping, and placing objects that vary in angle, occlusion, and orientation, with high precision.",
  },
  {
    id: "sorting",
    title: "Sorting",
    description:
      "Making a real-time call on visually similar items and routing each one correctly, under line speed pressure.",
  },
  {
    id: "fastening",
    title: "Fastening",
    description:
      "Joining parts that don't always align, modulating force and sequence to seat them correctly, and recovering when they don't.",
  },
  {
    id: "connectors",
    title: "Connectors",
    description:
      "Achieving a secure, verified fit despite flexible harnesses, part variation, and tight tolerances.",
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

  const activeStation = STATIONS[activeStationIndex] || STATIONS[0];

  return (
    <section
      ref={containerRef}
      className="bg-[#dbd7ca] dark:bg-[#081a1e] relative h-[400lvh] border-t border-[#d3d0c5] dark:border-white/10"
    >
      <div className="sticky top-0 h-lvh w-full overflow-hidden">
        {/* 3D Isometric Living Factory Floor Canvas */}
        <FactoryFloor3D
          scrollProgress={scrollProgress}
          onStationChange={setActiveStationIndex}
        />

        {/* Pinned Top-Left Headline */}
        <div className="absolute top-10 left-6 md:top-14 md:left-12 lg:left-16 z-10 pointer-events-none select-none">
          <h2 className="flex flex-col gap-2 max-w-none">
            {/* Line 1: Intelligence on */}
            <span className="flex">
              <span className="grid-pile-inline shrink-0 h-14 md:h-20 lg:h-24 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
                <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-[#299093] text-white font-bold">
                  Intelligence on
                </span>
              </span>
            </span>

            {/* Line 2: [White Dot] + [White pill: the factory floor] */}
            <span className="flex items-center gap-3">
              <span className="h-14 md:h-20 lg:h-24 aspect-square rounded-full bg-white shrink-0 shadow-sm" />
              <span className="grid-pile-inline shrink-0 h-14 md:h-20 lg:h-24 overflow-hidden rounded-full whitespace-nowrap text-heading-2">
                <span className="tag-fan-layer flex h-full items-center px-6 md:px-10 bg-white text-[#061a1e] font-bold shadow-sm">
                  the factory floor
                </span>
              </span>
            </span>
          </h2>
        </div>

        {/* Pinned Bottom-Right Floating Telemetry Capability Card */}
        <div className="absolute bottom-8 right-6 md:bottom-12 md:right-12 lg:right-16 z-20 w-[92vw] max-w-[420px] bg-white dark:bg-[#0d252b] rounded-[2.4rem] p-7 md:p-9 shadow-2xl text-[#061a1e] dark:text-white border border-black/5 dark:border-white/10 transition-all duration-300">
          <div className="flex flex-col gap-3 min-h-[120px]">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#061a1e] dark:text-white">
              {activeStation.title}
            </h3>
            <p className="text-sm md:text-base leading-relaxed text-[#546063] dark:text-white/80 font-normal">
              {activeStation.description}
            </p>
          </div>

          {/* 4-Dot Pill Indicator Bar matching mindrobotics.com */}
          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
            {STATIONS.map((stn, idx) => {
              const isActive = idx === activeStationIndex;
              return (
                <button
                  key={stn.id}
                  type="button"
                  onClick={() => scrollToStation(idx)}
                  aria-label={`Jump to station ${idx + 1}: ${stn.title}`}
                  className="group relative flex items-center h-4 p-1 cursor-pointer focus:outline-none"
                >
                  <span
                    className={`relative block h-3 rounded-full overflow-hidden transition-all duration-300 ${
                      isActive
                        ? "w-14 md:w-20 bg-[#dbd7ca] dark:bg-white/20"
                        : "w-3 bg-black/15 dark:bg-white/20 hover:bg-black/30 dark:hover:bg-white/40"
                    }`}
                  >
                    {isActive && (
                      <span className="block h-full bg-[#299093] rounded-full w-full" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
