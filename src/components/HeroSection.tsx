"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PatternCanvas from "./PatternCanvas";
import HeroRobotArm3D from "./HeroRobotArm3D";
import FanTag from "./FanTag";

const HERO_SLIDES = [
  {
    id: 1,
    title: "Enduro Rotor Assembly Line",
    src: "/images/carousel-1.png",
    alt: "Mind Robotics Enduro rotor line precision tooling and automated production line",
  },
  {
    id: 2,
    title: "SMS Active Production Cell",
    src: "/images/carousel-2.png",
    alt: "Live automotive production cell capturing multi-angle vision and force telemetry",
  },
  {
    id: 3,
    title: "Component Feed & Staging",
    src: "/images/carousel-3.png",
    alt: "Dexterous part manipulation and high-variability staging area",
  },
  {
    id: 4,
    title: "High-Voltage Inverter Line",
    src: "/images/carousel-4.png",
    alt: "High-precision powertrain harness insertion and automated line verification",
  },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [section1CanReveal, setSection1CanReveal] = useState(false);
  const section1Ref = useRef<HTMLElement | null>(null);

  // Autoplay carousel timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Track scroll for authentic parallax based on Section 0 container height
  useEffect(() => {
    const handleScroll = () => {
      const svmin = Math.min(window.innerWidth, window.innerHeight);
      const totalH = window.innerHeight * 1.5 + svmin * 0.75;
      const p = Math.min(Math.max(window.scrollY / totalH, 0), 1);
      setScrollProgress(p);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section 1 Reveal Observer
  useEffect(() => {
    const el = section1Ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSection1CanReveal(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const leftY = -22 + scrollProgress * 16; // -22% to -6%
  const centerY = 40 - scrollProgress * 40; // 40% to 0%
  const rightY = scrollProgress * 10; // 0% to 10%

  return (
    <>
      {/* SECTION 0: Hero 3D Arm, Wordmark, and Parallax Capsules */}
      <section className="px-6 md:px-8 desktop:px-8 relative flex flex-col gap-y-36 md:gap-y-48 lg:gap-y-56 pt-28 md:pt-40 lg:pt-52">
        {/* 2D Pattern Canvas Background matching module 65578 */}
        <PatternCanvas
          seed={3}
          density={0.5}
          fade={["bottom"]}
          className="z-behind-content absolute inset-0 size-full pointer-events-none"
        />

        {/* 3D Cel-shaded Robotic Arm Viewport */}
        <div className="z-above-content pointer-events-none absolute inset-x-0 top-0 bottom-[-75svmin]">
          <HeroRobotArm3D />
        </div>

        {/* Wordmark Presentation */}
        <span className="z-above-content tablet:gap-[4.5vw] flex flex-col gap-[9.2vw] select-none">
          {/* "MIND" Wordmark SVG */}
          <svg
            className="w-[48%] md:w-[38%] h-auto self-start text-current wordmark-reveal"
            viewBox="0 0 333 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="MIND"
          >
            <g style={{ "--index": 0 } as React.CSSProperties}>
              <path
                d="m20.6 44.028 21.664 40.697c3.727 7 13.76 7 17.487 0l21.664-40.697v43.265c0 5.582 4.34 10.34 9.922 10.538 5.858.213 10.678-4.477 10.678-10.29V13.415c0-7.176-5.817-12.993-12.992-12.993a12.994 12.994 0 0 0-11.469 6.886L51.007 57.162 24.461 7.31A12.993 12.993 0 0 0 12.993.423C5.817.423 0 6.24 0 13.416V87.54c0 5.814 4.82 10.504 10.678 10.291 5.582-.199 9.923-4.956 9.923-10.538V44.028Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="m20.6 44.028 21.664 40.697c3.727 7 13.76 7 17.487 0l21.664-40.697v43.265c0 5.582 4.34 10.34 9.922 10.538 5.858.213 10.678-4.477 10.678-10.29V13.415c0-7.176-5.817-12.993-12.992-12.993a12.994 12.994 0 0 0-11.469 6.886L51.007 57.162 24.461 7.31A12.993 12.993 0 0 0 12.993.423C5.817.423 0 6.24 0 13.416V87.54c0 5.814 4.82 10.504 10.678 10.291 5.582-.199 9.923-4.956 9.923-10.538V44.028Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 1 } as React.CSSProperties}>
              <path
                d="M127.64.427c-5.688 0-10.298 4.61-10.298 10.298v76.82c0 5.687 4.61 10.297 10.298 10.297s10.298-4.61 10.298-10.298v-76.82c0-5.687-4.61-10.297-10.298-10.297Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M127.64.427c-5.688 0-10.298 4.61-10.298 10.298v76.82c0 5.687 4.61 10.297 10.298 10.297s10.298-4.61 10.298-10.298v-76.82c0-5.687-4.61-10.297-10.298-10.297Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 2 } as React.CSSProperties}>
              <path
                d="M211.784 92.412L173.86 37.546v50c0 5.814 -4.821 10.509 -10.683 10.296c-5.577 -0.209 -9.913 -4.962 -9.913 -10.543V13.875c0 -6.66 4.839 -12.472 11.444 -13.334a13.175 13.175 0 0 1 12.587 5.604l36.948 53.838V10.928c0 -5.557 4.316 -10.291 9.869 -10.495c5.833 -0.208 10.635 4.458 10.635 10.248v74.568c0 6.958 -5.641 12.599 -12.599 12.599a12.6 12.6 0 0 1 -10.364 -5.435Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M211.784 92.412L173.86 37.546v50c0 5.814 -4.821 10.509 -10.683 10.296c-5.577 -0.209 -9.913 -4.962 -9.913 -10.543V13.875c0 -6.66 4.839 -12.472 11.444 -13.334a13.175 13.175 0 0 1 12.587 5.604l36.948 53.838V10.928c0 -5.557 4.316 -10.291 9.869 -10.495c5.833 -0.208 10.635 4.458 10.635 10.248v74.568c0 6.958 -5.641 12.599 -12.599 12.599a12.6 12.6 0 0 1 -10.364 -5.435Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 3 } as React.CSSProperties}>
              <path
                d="M332.259 49.04c0 -10.148 -1.918 -18.805 -5.755 -26.067c-3.806 -7.261 -9.244 -12.827 -16.315 -16.695c-7.072 -3.9 -15.507 -5.851 -25.306 -5.851h-25.205c-5.309 0 -9.613 4.304 -9.613 9.614v78.188c0 5.31 4.304 9.614 9.613 9.614h24.92c9.894 0 18.393 -1.95 25.496 -5.851c7.134 -3.9 12.604 -9.497 16.41 -16.79c3.837 -7.294 5.755 -16.015 5.755 -26.162Z M270.661 80.005v-61.93h13.128c3.906 0 27.922 -0.406 27.922 30.965c0 31.13 -24.016 30.965 -27.922 30.965h-13.128Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M332.259 49.04c0 -10.148 -1.918 -18.805 -5.755 -26.067c-3.806 -7.261 -9.244 -12.827 -16.315 -16.695c-7.072 -3.9 -15.507 -5.851 -25.306 -5.851h-25.205c-5.309 0 -9.613 4.304 -9.613 9.614v78.188c0 5.31 4.304 9.614 9.613 9.614h24.92c9.894 0 18.393 -1.95 25.496 -5.851c7.134 -3.9 12.604 -9.497 16.41 -16.79c3.837 -7.294 5.755 -16.015 5.755 -26.162Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
          </svg>

          {/* "ROBOTICS" Wordmark SVG */}
          <svg
            className="w-full h-auto self-end text-current wordmark-reveal"
            style={{ "--index-start": 4 } as React.CSSProperties}
            viewBox="0 0 679 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="ROBOTICS"
          >
            <g style={{ "--index": 0 } as React.CSSProperties}>
              <path
                d="M20.6 47.552V18.06h17.791c3.965 0 7.246.586 9.847 1.76 2.633 1.14 4.583 2.821 5.851 5.04 1.3 2.221 1.95 4.948 1.95 8.183 0 3.204-.65 5.884-1.95 8.04-1.268 2.156-3.203 3.773-5.803 4.852-2.601 1.078-5.867 1.617-9.8 1.617H20.601Z M43.607 64.101l15.514 29.032l-0.002 0.002c1.745 3.267 5.092 5.468 8.795 5.507c7.62 0.08 12.483 -8.056 8.848 -14.725l-13.517 -24.73c4.18 -2.38 7.46 -5.514 9.82 -9.452c2.797 -4.654 4.19 -10.227 4.19 -16.689s-1.383 -12.036 -4.14 -16.796c-2.73 -4.788 -6.706 -8.484 -11.94 -11.087C55.982 2.53 49.703 1.215 42.34 1.215H10.97C4.912 1.215 0 6.127 0 12.185v75.81c0 5.675 4.441 10.543 10.116 10.644c5.775 0.103 10.483 -4.55 10.483 -10.302V64.101h23.008Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M20.6 47.552V18.06h17.791c3.965 0 7.246.586 9.847 1.76 2.633 1.14 4.583 2.821 5.851 5.04 1.3 2.221 1.95 4.948 1.95 8.183 0 3.204-.65 5.884-1.95 8.04-1.268 2.156-3.203 3.773-5.803 4.852-2.601 1.078-5.867 1.617-9.8 1.617H20.601Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 1 } as React.CSSProperties}>
              <path
                d="M134.271.002c-27.608 0-49.988 22.38-49.988 49.988s22.38 49.988 49.988 49.988 49.988-22.38 49.988-49.988S161.879.002 134.271.002Z M134.271 79.377c-16.23 0-29.387-13.157-29.387-29.387s13.157-29.387 29.387-29.387 29.388 13.157 29.388 29.387-13.158 29.387-29.388 29.387Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M134.271.002c-27.608 0-49.988 22.38-49.988 49.988s22.38 49.988 49.988 49.988 49.988-22.38 49.988-49.988S161.879.002 134.271.002Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 2 } as React.CSSProperties}>
              <path
                d="M214.738 81.803h20.692c5.74 0 9.925-1.094 12.558-3.283 2.633-2.22 3.949-5.169 3.949-8.847 0-2.695-.65-5.073-1.95-7.135-1.3-2.062-3.155-3.678-5.566-4.852-2.378-1.173-5.217-1.76-8.514-1.76h-21.168v25.878l-.001-.001Z M214.738 41.988h19.169c2.823 0 5.328-.492 7.517-1.474 2.219-1.015 3.963-2.442 5.232-4.283 1.3-1.839 1.95-4.044 1.95-6.612 0-3.52-1.252-6.358-3.757-8.515-2.474-2.156-5.994-3.234-10.56-3.234h-19.551v24.117Z M194.136 49.933V12.196c0 -6.059 4.911 -10.971 10.971 -10.971h31.938v0.01c20.791 0 32.353 9.907 32.353 25.231c0 9.04 -4.018 15.686 -11.585 19.952A1.066 1.066 0 0 0 257.892 48.322c9.756 4.476 14.979 13.098 14.979 23.587c0 16.235 -12.132 26.722 -34.578 26.722l1.374 0.01h-34.56c-6.059 0 -10.971 -4.911 -10.971 -10.971V49.933Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M214.738 81.803h20.692c5.74 0 9.925-1.094 12.558-3.283 2.633-2.22 3.949-5.169 3.949-8.847 0-2.695-.65-5.073-1.95-7.135-1.3-2.062-3.155-3.678-5.566-4.852-2.378-1.173-5.217-1.76-8.514-1.76h-21.168v25.878l-.001-.001Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 3 } as React.CSSProperties}>
              <path
                d="M328.791.002c-27.608 0-49.988 22.38-49.988 49.988s22.38 49.988 49.988 49.988 49.988-22.38 49.988-49.988S356.399.002 328.791.002Z M328.791 79.377c-16.23 0-29.388-13.157-29.388-29.387s13.158-29.387 29.388-29.387c16.23 0 29.387 13.157 29.387 29.387s-13.157 29.387-29.387 29.387Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M328.791.002c-27.608 0-49.988 22.38-49.988 49.988s22.38 49.988 49.988 49.988 49.988-22.38 49.988-49.988S356.399.002 328.791.002Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 4 } as React.CSSProperties}>
              <path
                d="M427.084 21.197h21.569c5.627 0 10.189 -4.562 10.189 -10.19c0 -5.626 -4.562 -10.188 -10.189 -10.188h-63.515c-5.627 0 -10.189 4.562 -10.189 10.189s4.562 10.189 10.189 10.189h21.588v67.265c0 5.685 4.66 10.282 10.369 10.178c5.604 -0.102 9.989 -4.91 9.989 -10.516V21.197Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M427.084 21.197h21.569c5.627 0 10.189 -4.562 10.189 -10.19c0 -5.626 -4.562 -10.188 -10.189 -10.188h-63.515c-5.627 0 -10.189 4.562 -10.189 10.189s4.562 10.189 10.189 10.189h21.588v67.265c0 5.685 4.66 10.282 10.369 10.178c5.604 -0.102 9.989 -4.91 9.989 -10.516V21.197Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 5 } as React.CSSProperties}>
              <path
                d="M479.653 1.221c5.687 0 10.298 4.612 10.298 10.299v76.823c0 5.688-4.611 10.299-10.298 10.299-5.686 0-10.299-4.611-10.299-10.299V11.52c0-5.687 4.612-10.299 10.299-10.299Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M479.653 1.221c5.687 0 10.298 4.612 10.298 10.299v76.823c0 5.688-4.611 10.299-10.298 10.299-5.686 0-10.299-4.611-10.299-10.299V11.52c0-5.687 4.612-10.299 10.299-10.299Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 6 } as React.CSSProperties}>
              <path
                d="M500.945 49.986c0 27.452 21.688 49.528 49.136 49.99c14.857 0.249 28.263 -5.982 37.569 -16.056c4.131 -4.473 3.518 -11.533 -1.333 -15.214c-4.265 -3.237 -10.23 -2.602 -13.879 1.316c-5.362 5.756 -13.01 9.352 -21.497 9.352c-16.855 0 -30.391 -14.181 -29.329 -31.267c0.899 -14.447 12.511 -26.272 26.94 -27.413c9.539 -0.754 18.217 3.055 24.081 9.476c3.536 3.873 9.511 4.272 13.688 1.1l0.004 -0.004c4.768 -3.621 5.535 -10.603 1.493 -15.02C578.68 6.262 565.539 0 550.941 0c-27.614 0 -49.996 22.381 -49.996 49.986Z"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M500.945 49.986c0 27.452 21.688 49.528 49.136 49.99c14.857 0.249 28.263 -5.982 37.569 -16.056c4.131 -4.473 3.518 -11.533 -1.333 -15.214c-4.265 -3.237 -10.23 -2.602 -13.879 1.316c-5.362 5.756 -13.01 9.352 -21.497 9.352c-16.855 0 -30.391 -14.181 -29.329 -31.267c0.899 -14.447 12.511 -26.272 26.94 -27.413c9.539 -0.754 18.217 3.055 24.081 9.476c3.536 3.873 9.511 4.272 13.688 1.1l0.004 -0.004c4.768 -3.621 5.535 -10.603 1.493 -15.02C578.68 6.262 565.539 0 550.941 0c-27.614 0 -49.996 22.381 -49.996 49.986Z"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
            <g style={{ "--index": 7 } as React.CSSProperties}>
              <path
                d="M641.056 99.976c-14.852.458-29.645-5.873-38.804-15.513-4.065-4.28-3.567-11.132 1.085-14.766 4.092-3.196 9.882-2.661 13.474 1.087 7.439 6.13 18.009 10.417 25.474 10.313 10.627-.15 15.755-6.22 15.256-11.495-.421-4.44-4.948-8.784-19.394-11.732-16.599-3.386-34.212-9.715-34.499-30.175-.15-10.803 9.485-27.307 36.124-27.682l.004.004c6.186-.087 14.965 1.512 21.292 4.858h.009a38.505 38.505 0 0 1 11.691 9.482c3.059 3.67 2.576 9.131-1.047 12.245-3.7 3.181-9.266 2.711-12.423-1.008-4.83-5.69-11.816-8.312-19.281-8.207-10.628.15-15.756 6.22-15.257 11.494.421 4.44 4.948 8.784 19.394 11.732 16.599 3.387 33.621 8.537 34.475 28.422.178 12.681-8.282 30.53-37.572 30.941"
                fill="currentColor"
                fillOpacity={0}
              />
              <path
                d="M641.056 99.976c-14.852.458-29.645-5.873-38.804-15.513-4.065-4.28-3.567-11.132 1.085-14.766 4.092-3.196 9.882-2.661 13.474 1.087 7.439 6.13 18.009 10.417 25.474 10.313 10.627-.15 15.755-6.22 15.256-11.495-.421-4.44-4.948-8.784-19.394-11.732-16.599-3.386-34.212-9.715-34.499-30.175-.15-10.803 9.485-27.307 36.124-27.682l.004.004c6.186-.087 14.965 1.512 21.292 4.858h.009a38.505 38.505 0 0 1 11.691 9.482c3.059 3.67 2.576 9.131-1.047 12.245-3.7 3.181-9.266 2.711-12.423-1.008-4.83-5.69-11.816-8.312-19.281-8.207-10.628.15-15.756 6.22-15.257 11.494.421 4.44 4.948 8.784 19.394 11.732 16.599 3.387 33.621 8.537 34.475 28.422.178 12.681-8.282 30.53-37.572 30.941"
                stroke="currentColor"
                strokeDasharray={1.01}
                strokeDashoffset={1.01}
                pathLength={1}
              />
            </g>
          </svg>
        </span>

        {/* Triple Background Capsule Silhouette Geometry matching mindrobotics.com */}
        <div className="flex justify-between laptop:px-[inherit] select-none pointer-events-none">
          <span
            className="w-[32%] rounded-full bg-white aspect-[2/5] z-behind-content transition-transform duration-75 ease-out"
            style={{ transform: `translateY(${leftY}%)` }}
          />
          <span
            className="w-[32%] rounded-full bg-white mt-[9.6%] aspect-square self-start z-above-content transition-transform duration-75 ease-out"
            style={{ transform: `translateY(${centerY}%)` }}
          />
          <span
            className="w-[32%] rounded-full bg-white aspect-[2/5] z-behind-content transition-transform duration-75 ease-out"
            style={{ transform: `translateY(${rightY}%)` }}
          />
        </div>
      </section>

      {/* SECTION 1: Main Statement & Narrative Copy */}
      <section
        ref={section1Ref}
        className="layout-grid laptop:gap-y-14 gap-y-8 pt-[6.4rem] tablet:pt-[11.2rem] pb-[6.4rem] tablet:pb-[11.2rem]"
      >
        {/* Headline with Staggered Multi-Color Fan Tags */}
        <h1 className="text-heading-1 tablet:col-span-9 tablet:col-start-2 laptop:col-span-9 laptop:col-start-3 laptop:max-w-[100rem] col-span-6 col-start-1 text-balance">
          <span
            role="text"
            aria-label="Mind Robotics is building universally capable robots to transform industrial work."
          >
            {/* Pill 1: Mind Robotics */}
            <span className="-ml-[var(--tag-padding-inline)] inline-block align-baseline">
              <FanTag
                text="Mind Robotics"
                color="#299093"
                textColor="text-white"
                size="headline"
                canReveal={section1CanReveal}
                delay={0}
              />
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "0.2s" } as React.CSSProperties}
            >
              is
            </span>{" "}
            <span
              className="headline-word mr-[var(--tag-padding-inline)]"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "0.35s" } as React.CSSProperties}
            >
              building
            </span>{" "}
            {/* Pill 2: universally */}
            <span className="-ml-[var(--tag-padding-inline)] mr-[var(--tag-padding-inline)] inline-block align-baseline">
              <FanTag
                text="universally"
                color="#ffffff"
                textColor="text-[#061a1e]"
                size="headline"
                canReveal={section1CanReveal}
                delay={0.5}
              />
            </span>{" "}
            {/* Pill 3: capable */}
            <span className="-ml-[var(--tag-padding-inline)] mr-[var(--tag-padding-inline)] inline-block align-baseline">
              <FanTag
                text="capable"
                color="#ef6156"
                textColor="text-white"
                size="headline"
                canReveal={section1CanReveal}
                delay={0.7}
              />
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "0.85s" } as React.CSSProperties}
            >
              robots
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.0s" } as React.CSSProperties}
            >
              to
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.15s" } as React.CSSProperties}
            >
              transform
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.3s" } as React.CSSProperties}
            >
              industrial
            </span>{" "}
            <span
              className="headline-word"
              data-can-reveal={section1CanReveal ? "true" : "false"}
              style={{ "--delay": "1.45s" } as React.CSSProperties}
            >
              work.
            </span>
          </span>
        </h1>

        {/* Supporting Narrative Paragraphs */}
        <div className="text-paragraph-large tablet:col-span-7 tablet:col-start-2 laptop:col-span-5 laptop:col-start-3 laptop:max-w-[60rem] col-span-6 col-start-1">
          <p>
            <strong className="font-bold">We&apos;re starting</strong> where the
            problems are hardest and the standards are least forgiving: the factory floor. Mind is
            collecting video data at industrial scale, capturing live, high-variability work as it
            happens on the line, starting with automotive manufacturing.
          </p>
          <p>
            Our foundation models learn spatial reasoning, object dynamics, and tool manipulation
            across real production hours, building a scalable intelligence layer that generalizes to
            new tasks and environments. The hardware we design works alongside the people and systems
            already in place.
          </p>
        </div>
      </section>

      {/* SECTION 2: Full-Bleed 2:1 Hero Factory Photography Carousel */}
      <section
        className="relative grid-pile w-full aspect-[2/1] overflow-hidden bg-black/40 border-y border-black/10 dark:border-white/10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides */}
        <ol className="grid-pile size-full overflow-hidden" aria-live="polite">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <li
                key={slide.id}
                data-active={isActive ? "true" : "false"}
                className={`carousel-slide size-full transition-opacity duration-700 ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!isActive}
              >
                <div className="relative size-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="object-cover"
                  />
                  {/* Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Caption */}
                  <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-10 text-white pointer-events-none">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#299093] bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                      0{slide.id} — Production Telemetry
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold mt-2 text-white/95 drop-shadow-md">
                      {slide.title}
                    </h3>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Carousel Expandable Dot Navigation */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-12 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                aria-label={`View slide ${idx + 1}: ${slide.title}`}
                className="group relative flex items-center h-4 p-1 cursor-pointer focus:outline-none"
              >
                <span
                  className={`relative block h-3 rounded-full overflow-hidden transition-all duration-300 ${
                    isActive
                      ? "w-14 md:w-20 lg:w-28 bg-[#dbd7ca] dark:bg-white/20"
                      : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                >
                  {isActive && (
                    <span
                      className="block h-full bg-[#299093] rounded-full"
                      style={{
                        animation: "progressFill 5.5s linear forwards",
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}
