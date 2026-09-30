"use client";

import React, { useState } from "react";
import Link from "next/link";
import DavidContactScene3D from "@/components/DavidContactScene3D";
import { ArrowUp } from "lucide-react";

export default function ContactPage() {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText("rishiicreates@gmail.com").catch(() => {});
      }
    } catch {}
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative w-full min-h-screen h-screen overflow-hidden bg-[#e8e5e0] text-[#061a1e] flex flex-col justify-between select-none">
      {/* 1. Interactive 3D Canvas Background (Exact David Heckhoff Scene) */}
      <DavidContactScene3D className="z-0" />

      {/* 2. Top Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-12 py-3 sm:py-6 md:py-8 w-full">
        {/* Left: Monogram / Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 focus:outline-none"
          aria-label="Rishii Home"
        >
          <svg
            className="h-8 sm:h-9 md:h-11 w-auto text-[#061a1e] transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 80 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M25.6 51.2V12.8C25.6 5.73 19.87 0 12.8 0S0 5.73 0 12.8v38.4C0 58.27 5.73 64 12.8 64s12.8-5.73 12.8-12.8Z"
            />
            <path
              fill="currentColor"
              d="M27.2 32c0 7.07 5.73 12.8 12.8 12.8s12.8-5.73 12.8-12.8-5.73-12.8-12.8-12.8-12.8 5.73-12.8 12.8Z"
            />
            <path
              fill="currentColor"
              d="M80 51.2V12.8C80 5.73 74.27 0 67.2 0c-7.069 0-12.8 5.73-12.8 12.8v38.4c0 7.07 5.731 12.8 12.8 12.8C74.27 64 80 58.27 80 51.2Z"
            />
          </svg>
        </Link>

        {/* Center: Nav Pills with Active Contact Highlight [ Home | Work | Contact ] */}
        <nav className="flex items-center bg-[#dbd7ca]/80 backdrop-blur-md border border-[#061a1e]/[0.08] p-1 sm:p-1.5 rounded-full shadow-[0_4px_20px_rgba(6,26,30,0.06)]">
          <Link
            href="/"
            className="px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-[#061a1e]/70 hover:text-[#061a1e] rounded-full transition-colors"
          >
            Home
          </Link>
          <Link
            href="/work"
            className="px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-[#061a1e]/70 hover:text-[#061a1e] rounded-full transition-colors"
          >
            Work
          </Link>
          <span
            className="px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-white bg-[#299093] rounded-full shadow-sm"
          >
            Contact
          </span>
        </nav>

        {/* Right: Get In Touch CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="mailto:rishiicreates@gmail.com"
            onClick={(e) => handleCopyEmail(e)}
            className="group grid-pile hidden sm:grid h-9 md:h-11 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-xs md:text-sm font-bold uppercase tracking-wider px-5 shadow-sm transition-transform active:scale-95"
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
            <span className="relative z-10 leading-none">
              {showCopied ? "Email Copied!" : "Get In Touch"}
            </span>
          </a>
        </div>
      </header>

      {/* 3. Hero Editorial Content (Exact Headline & Social Links) */}
      <div className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 flex-1 flex flex-col justify-start pt-12 md:pt-20 pointer-events-none">
        <div className="max-w-xl pointer-events-auto">
          {/* Bold Editorial Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight text-[#061a1e] leading-[0.98] drop-shadow-sm">
            Let&apos;s work
            <br />
            together!
          </h1>

          {/* 4 Social Action Buttons with Circle Pill Styling & Custom Vector Icons */}
          <div className="flex items-center gap-3 md:gap-4 mt-8">
            {/* Mail */}
            <a
              href="mailto:rishiicreates@gmail.com"
              className="size-11 md:size-13 rounded-full bg-white/95 hover:bg-[#299093] text-[#061a1e] hover:text-white border border-[#061a1e]/[0.08] shadow-[0_4px_16px_rgba(6,26,30,0.08)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Send email"
              title="rishiicreates@gmail.com"
            >
              <svg viewBox="0 0 256 256" className="size-5 fill-none stroke-current" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
                <rect x="10" y="41" width="236" height="174" rx="20" />
                <path d="M16.5 46.5L114.918 126.742C122.25 132.72 132.768 132.743 140.126 126.797L239.5 46.5" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/rishiicreates"
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 md:size-13 rounded-full bg-white/95 hover:bg-[#061a1e] text-[#061a1e] hover:text-white border border-[#061a1e]/[0.08] shadow-[0_4px_16px_rgba(6,26,30,0.08)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="GitHub profile"
            >
              <svg viewBox="0 0 256 256" className="size-5 fill-current">
                <path d="M127.619 0C57.2619 0 0 58.6667 0 131.245C0 189.261 36.5533 238.368 87.2624 255.755C93.6 257.059 95.9253 252.928 95.9253 249.451C95.9253 245.107 95.7163 230.981 95.7163 213.381C60.6407 221.205 53.4674 196.213 53.4674 196.213C47.7667 181.216 39.5293 177.307 39.5293 177.307C27.9107 169.267 40.3733 169.483 40.3733 169.483C53.044 170.352 60.0073 182.739 60.0073 182.739C71.1987 202.515 89.3787 196.864 96.5587 193.605C97.6147 185.128 100.993 179.477 104.795 176.003C76.2693 172.741 46.4787 161.661 46.4787 111.248C46.4787 96.9067 51.3373 85.1733 59.5787 76.048C58.312 72.7893 53.8707 59.3147 60.8453 41.28C60.8453 41.28 71.6213 37.8027 95.92 54.752C106.063 51.928 117.048 50.4053 127.824 50.4053C138.599 50.4053 149.584 51.928 159.728 54.752C184.027 37.8027 194.803 41.28 194.803 41.28C201.777 59.3147 197.336 72.7893 196.07 76.048C204.311 85.1733 209.17 96.9067 209.17 111.248C209.17 161.661 179.38 172.741 150.854 176.003C155.504 180.131 159.516 187.953 159.516 200.339C159.516 217.939 159.307 232.065 159.307 236.409C159.307 239.886 161.632 244.017 167.97 242.713C218.679 225.326 255.232 176.219 255.232 118.203C255.441 45.6247 198.183 -13.042 127.825 -13.042L127.619 0Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/rishiicreates/"
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 md:size-13 rounded-full bg-white/95 hover:bg-[#299093] text-[#061a1e] hover:text-white border border-[#061a1e]/[0.08] shadow-[0_4px_16px_rgba(6,26,30,0.08)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="LinkedIn profile"
            >
              <svg viewBox="0 0 256 256" className="size-5 fill-current">
                <path d="M43.6555 13C26.7646 13 13.0124 26.7496 13 43.6538C13 60.5579 26.7523 74.3102 43.6555 74.3102C60.5526 74.3102 74.2978 60.5579 74.2978 43.6538C74.2978 26.7514 60.5517 13 43.6555 13Z" />
                <path d="M66.6629 86.627H20.6447C18.4557 86.627 16.6801 88.4017 16.6801 90.5925V238.711C16.6801 240.901 18.4557 242.676 20.6447 242.676H66.662C68.8519 242.676 70.6274 240.9 70.6274 238.711V90.5925C70.6283 88.4017 68.8528 86.627 66.6629 86.627Z" />
                <path d="M184.306 84.8832C167.466 84.8832 152.667 90.0112 143.636 98.3732V90.5924C143.636 88.4017 141.86 86.627 139.671 86.627H95.5278C93.338 86.627 91.5624 88.4017 91.5624 90.5924V238.711C91.5624 240.901 93.338 242.676 95.5278 242.676H141.502C143.692 242.676 145.467 240.9 145.467 238.711V165.43C145.467 144.404 149.335 131.371 168.635 131.371C187.651 131.394 189.074 145.369 189.074 166.686V238.711C189.074 240.901 190.849 242.676 193.04 242.676H239.035C241.224 242.676 243 240.9 243 238.711V157.462C242.999 123.67 236.328 84.8832 184.306 84.8832Z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/rishiicreates"
              target="_blank"
              rel="noopener noreferrer"
              className="size-11 md:size-13 rounded-full bg-white/95 hover:bg-[#061a1e] text-[#061a1e] hover:text-white border border-[#061a1e]/[0.08] shadow-[0_4px_16px_rgba(6,26,30,0.08)] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="X (Twitter) profile"
            >
              <svg viewBox="0 0 256 256" className="size-5 fill-current">
                <path d="M199.87 14.6936C201.389 12.9806 203.568 12 205.857 12H223.816C230.697 12 234.368 20.1125 229.825 25.2814L159.651 105.122C157.142 107.976 156.987 112.202 159.281 115.232L246.289 230.172C250.278 235.441 246.519 243 239.91 243H180.959C178.468 243 176.12 241.84 174.606 239.862L121.096 169.947C118.027 165.936 112.055 165.738 108.726 169.537L46.7487 240.272C45.2297 242.006 43.0367 243 40.7317 243H22.6899C15.8261 243 12.1492 234.924 16.6561 229.747L92.1084 143.078C94.6033 140.213 94.7382 135.987 92.4313 132.968L9.8241 24.8572C5.80151 19.5926 9.5554 12 16.1808 12H76.9764C79.482 12 81.8429 13.1739 83.3552 15.1718L130.938 78.0349C133.985 82.0608 139.954 82.2917 143.304 78.5131L199.87 14.6936ZM186.122 216.851C187.636 218.827 189.983 219.985 192.473 219.985H194.181C200.791 219.985 204.549 212.424 200.558 207.155L71.9243 37.332C70.412 35.3354 68.0519 34.1624 65.5472 34.1624H62.3576C55.7273 34.1624 51.9748 41.7648 56.0072 47.0279L186.122 216.851Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Bottom Notch / Footer Bar */}
      <footer className="relative z-20 w-full px-6 md:px-12 py-5 flex items-center justify-between text-xs md:text-sm text-[#061a1e]/70">
        {/* Left: Legal / Credits */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hover:text-[#061a1e] transition-colors"
          >
            Privacy
          </Link>
          <span>•</span>
          <Link
            href="/"
            className="hover:text-[#061a1e] transition-colors"
          >
            Legal Notice
          </Link>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[#061a1e]/50">
            Delhi NCR, India
          </span>
        </div>

        {/* Center: Scroll Notch Button */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3">
          <button
            type="button"
            onClick={scrollToTop}
            className="size-9 rounded-full bg-white/95 border border-[#061a1e]/[0.1] shadow-sm flex items-center justify-center text-[#061a1e] hover:bg-[#061a1e] hover:text-white transition-all hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>

        {/* Right: Availability Badge & Quick Contact Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-[#061a1e]/[0.08] shadow-sm">
            <span className="size-2 rounded-full bg-[#299093] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#061a1e] font-semibold">
              Available for projects
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
