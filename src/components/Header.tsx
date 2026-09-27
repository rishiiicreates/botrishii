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

      {/* Contact Modal Dialog - Styled Exactly Consistent with Mind Robotics UI */}
      {contactOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="py-8 flex w-full max-w-md flex-col items-center gap-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Card with Warm Concrete Background & Large Pill Geometry */}
            <div className="bg-[#e8e5e0] rounded-[3.2rem] md:rounded-[4rem] border border-[#061a1e]/[0.08] flex w-full flex-col gap-8 p-8 md:p-12 shadow-[0_24px_64px_rgba(6,26,30,0.18)] text-[#061a1e]">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#061a1e]">
                  Contact us
                </h2>
                <Link
                  href="/contact"
                  onClick={() => setContactOpen(false)}
                  className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/50 hover:text-[#299093] transition-colors"
                >
                  Full page ↗
                </Link>
              </div>

              <dl className="text-base md:text-lg flex flex-col gap-6 text-[#061a1e]">
                <div>
                  <dt className="text-[#061a1e]/60 font-medium text-sm uppercase tracking-wider font-mono">
                    Address
                  </dt>
                  <dd className="font-semibold text-lg md:text-xl mt-0.5">Palo Alto, CA</dd>
                </div>
                <div>
                  <dt className="text-[#061a1e]/60 font-medium text-sm uppercase tracking-wider font-mono">
                    Phone number
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href="tel:+14084599351"
                      className="font-semibold text-lg md:text-xl hover:text-[#299093] transition-colors"
                    >
                      408-459-9351
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#061a1e]/60 font-medium text-sm uppercase tracking-wider font-mono">
                    Email
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href="mailto:press@mindrobotics.com"
                      className="font-semibold text-lg md:text-xl hover:text-[#299093] transition-colors"
                    >
                      press@mindrobotics.com
                    </a>
                  </dd>
                </div>
              </dl>

              {/* Action Buttons with 3-Layer Slide-in Waterfall */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="mailto:press@mindrobotics.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid-pile h-11 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#061a1e] text-[1.4rem] font-bold"
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
                  <span className="relative z-10 px-5 text-center leading-none">Send email</span>
                </a>

                <button
                  type="button"
                  onClick={copyAddress}
                  className="group grid-pile h-11 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.4rem] font-bold"
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
                  <span className="relative z-10 px-5 text-center leading-none">
                    {copied ? "Address Copied!" : "Copy Address"}
                  </span>
                </button>
              </div>
            </div>

            {/* Close Button Below Card Matching Live Site */}
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="flex min-h-11 cursor-pointer items-center gap-1.5 px-3 text-white text-base md:text-lg hover:text-[#ffbd00] transition-colors"
              aria-label="Close dialog"
            >
              <X className="size-5" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
