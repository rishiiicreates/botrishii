"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Copy, Check, X } from "lucide-react";

export default function Header() {
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText("Palo Alto, CA");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-start justify-between py-6 px-6 md:px-12 pointer-events-none transition-all duration-300">
        {/* Monogram Logo */}
        <Link
          href="/"
          className="pointer-events-auto group focus:outline-none"
          aria-label="Mind Robotics Home"
        >
          <svg
            className="h-10 md:h-12 w-auto text-current transition-transform duration-300 group-hover:scale-105"
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

        {/* Action Controls */}
        <nav className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          {/* Join Us CTA */}
          <a
            href="https://nacreous-one.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group grid-pile h-10 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.4rem] font-bold"
          >
            {/* 3-layer slide-in hover waterfall */}
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
            <span className="relative z-10 px-5 text-center leading-none">Join us</span>
          </a>

          {/* Contact Button */}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="group grid-pile h-10 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.4rem] font-bold"
            aria-haspopup="dialog"
            aria-expanded={contactOpen}
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
            <span className="relative z-10 px-5 text-center leading-none">Contact</span>
          </button>
        </nav>
      </header>

      {/* Contact Modal Dialog - Sized to at least 45% of screen area */}
      {contactOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="py-6 flex w-full max-w-[94vw] md:w-[68vw] lg:w-[66vw] max-w-5xl flex-col items-center gap-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Card with Warm Concrete Background & Large Pill Geometry */}
            <div
              className="bg-[#e8e5e0] rounded-[3.6rem] md:rounded-[4.8rem] border border-[#061a1e]/[0.08] flex w-full flex-col justify-between p-10 md:p-14 lg:p-16 shadow-[0_32px_80px_rgba(6,26,30,0.22)] text-[#061a1e]"
              style={{ minHeight: "75vh" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#dbd7ca] text-[#061a1e] font-semibold">
                    Mind Robotics
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#dbd7ca] text-[#061a1e] font-semibold">
                    Palo Alto, CA
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#dbd7ca] text-[#061a1e] font-semibold hidden md:inline-block">
                    HQ Lab
                  </span>
                </div>
                <Link
                  href="/contact"
                  onClick={() => setContactOpen(false)}
                  className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/60 hover:text-[#299093] transition-colors"
                >
                  Full page ↗
                </Link>
              </div>

              <div className="flex flex-col gap-3 my-2">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#061a1e]">
                  Contact us
                </h2>
                <p className="text-lg md:text-2xl text-[#061a1e]/70 leading-relaxed max-w-2xl text-balance">
                  We are building universally capable robotics for physical industrial labor. Connect with our engineering, commercial, and research teams.
                </p>
              </div>

              {/* Spacious 3-Column Channels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-[#061a1e]/10">
                <div className="p-6 rounded-[2rem] bg-white/60 border border-[#061a1e]/[0.06] flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/60 font-medium">Headquarters</span>
                    <p className="text-xl md:text-2xl font-bold text-[#061a1e] mt-1">Palo Alto, CA</p>
                  </div>
                  <span className="text-xs text-[#061a1e]/60 font-mono">Silicon Valley Lab</span>
                </div>

                <div className="p-6 rounded-[2rem] bg-white/60 border border-[#061a1e]/[0.06] flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/60 font-medium">Telephone</span>
                    <p className="text-xl md:text-2xl font-bold text-[#061a1e] mt-1">
                      <a href="tel:+14084599351" className="hover:text-[#299093] transition-colors">408-459-9351</a>
                    </p>
                  </div>
                  <span className="text-xs text-[#061a1e]/60 font-mono">Mon–Fri 9am–6pm PST</span>
                </div>

                <div className="p-6 rounded-[2rem] bg-white/60 border border-[#061a1e]/[0.06] flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/60 font-medium">Inquiries & Press</span>
                    <p className="text-xl md:text-2xl font-bold text-[#061a1e] mt-1 truncate">
                      <a href="mailto:press@mindrobotics.com" className="hover:text-[#299093] transition-colors">press@mindrobotics.com</a>
                    </p>
                  </div>
                  <span className="text-xs text-[#061a1e]/60 font-mono">&lt; 24h response time</span>
                </div>
              </div>

              {/* Action Buttons with 3-Layer Slide-in Waterfall */}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a
                  href="mailto:press@mindrobotics.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid-pile h-12 md:h-14 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#061a1e] text-[1.5rem] font-bold"
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
                    className="pointer-events-none size-full -translate-x-full rounded-[inherit] transition-transform duration-600 ease-in-out group-hover:translate-x-0 bg-[#299093] delay-[120ms]"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 px-8 text-center leading-none">Send email</span>
                </a>

                <button
                  type="button"
                  onClick={copyAddress}
                  className="group grid-pile h-12 md:h-14 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.5rem] font-bold"
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
                  <span className="relative z-10 px-8 text-center leading-none">
                    {copied ? "Address Copied!" : "Copy Address"}
                  </span>
                </button>
              </div>
            </div>

            {/* Close Button Below Card Matching Live Site */}
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="flex min-h-12 cursor-pointer items-center gap-2 px-4 text-white text-lg md:text-xl hover:text-[#ffbd00] transition-colors"
              aria-label="Close dialog"
            >
              <X className="size-6" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
