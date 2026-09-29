"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-start justify-between py-6 px-6 md:px-12 pointer-events-none transition-all duration-300">
      {/* Monogram Logo */}
      <Link
        href="/"
        className="pointer-events-auto group focus:outline-none"
        aria-label="Rishii Home"
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
          <span className="relative z-10 px-5 text-center leading-none">Join me</span>
        </a>

        {/* Projects CTA linking directly to dedicated /projects page */}
        <Link
          href="/projects"
          className="group grid-pile h-10 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.4rem] font-bold"
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
          <span className="relative z-10 px-5 text-center leading-none">Projects</span>
        </Link>

        {/* Contact CTA linking directly to dedicated /contact page */}
        <Link
          href="/contact"
          className="group grid-pile h-10 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-[1.4rem] font-bold"
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
        </Link>
      </nav>
    </header>
  );
}
