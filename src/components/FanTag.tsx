"use client";

import React from "react";

interface FanTagProps {
  text?: string;
  color: string;
  textColor?: string;
  size?: "headline" | "large" | "medium";
  canReveal?: boolean;
  delay?: number;
  className?: string;
  ariaHidden?: boolean;
}

// Exact trail colors
const TRAIL_MAP: Record<string, string[]> = {
  "#299093": ["#061a1e", "#ffbd00"],
  "#ffbd00": ["#299093", "#ef6156"],
  "#ffffff": ["#ef6156", "#299093", "#ffbd00"],
  "#dbd7ca": ["#ffbd00", "#299093", "#ef6156"],
  "#061a1e": ["#ef6156", "#ffbd00", "#299093"],
  "#ef6156": ["#ef6156", "#299093", "#ffbd00"],
  "#8f8c83": ["#ffbd00", "#299093", "#ef6156"],
};

const DEFAULT_TRAIL = ["#ef6156", "#299093", "#ffbd00"];

export default function FanTag({
  text,
  color,
  textColor,
  size = "medium",
  canReveal = true,
  delay = 0,
  className = "",
  ariaHidden = false,
}: FanTagProps) {
  const isDot = !text;
  const normalizedColor = color.toLowerCase();
  const trail = TRAIL_MAP[normalizedColor] || DEFAULT_TRAIL;

  // Resolve text color automatically if not explicitly provided
  let computedTextColor = textColor;
  if (!computedTextColor && text) {
    if (
      normalizedColor === "#ffffff" ||
      normalizedColor === "#ffbd00" ||
      normalizedColor === "#dbd7ca"
    ) {
      computedTextColor = "text-[#061a1e]";
    } else {
      computedTextColor = "text-white";
    }
  }

  const heightClasses =
    size === "headline"
      ? "[--tag-height:1.25em] laptop:[--tag-height:1.3em]"
      : size === "large"
      ? "[--tag-height:4.6rem] tablet:[--tag-height:6rem] laptop:[--tag-height:10.4rem] text-heading-1"
      : "[--tag-height:4rem] tablet:[--tag-height:6rem] laptop:[--tag-height:8rem] text-heading-2";

  return (
    <span
      className={`grid-pile-inline h-[var(--tag-height)] overflow-clip rounded-[calc(var(--tag-height)/2)] whitespace-nowrap *:rounded-[inherit] ${heightClasses} ${
        isDot ? "aspect-square" : ""
      } ${className}`}
      data-reveal-type="fan"
      data-can-reveal={canReveal ? "true" : "false"}
      style={{ "--delay": `${delay}s` } as React.CSSProperties}
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {/* Base Layer: fades in */}
      <span className="tag-base bg-[#dbd7ca] dark:bg-[#11282d]" />

      {/* Fan Color Trail Layers: slide in from left staggered by index */}
      {trail.map((trailColor, i) => (
        <span
          key={i}
          className="tag-layer"
          style={
            {
              "--index": i,
              background: trailColor,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Final Top Layer with background and text */}
      <span
        className={`tag-layer flex h-full items-center font-bold leading-[var(--tag-height)] self-baseline ${
          isDot ? "" : "px-[var(--tag-padding-inline)]"
        } ${computedTextColor || ""}`}
        style={
          {
            backgroundColor: color,
            "--index": trail.length,
          } as React.CSSProperties
        }
      >
        {text}
      </span>
    </span>
  );
}
