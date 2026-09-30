"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  isDark?: boolean;
}

export default function Header({ isDark = false }: HeaderProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isWork = pathname === "/work" || pathname === "/projects";
  const isContact = pathname === "/contact";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between py-4 sm:py-6 px-4 sm:px-8 md:px-12 pointer-events-none transition-colors duration-300">
      {/* Monogram Logo */}
      <Link
        href="/"
        className="pointer-events-auto group focus:outline-none"
        aria-label="Rishii Home"
      >
        <svg
          className={`h-9 md:h-11 w-auto transition-all duration-300 group-hover:scale-105 ${
            isDark ? "text-white" : "text-[#061a1e]"
          }`}
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

      {/* Main Page: ONLY Contact CTA button; Other Pages: Navbar Capsule [ Home | Work | Contact ] on the right */}
      {isHome ? (
        <div className="flex items-center pointer-events-auto">
          <Link
            href="/contact"
            className="group grid-pile h-10 w-fit cursor-pointer items-center overflow-hidden rounded-full text-white bg-[#299093] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-95"
            aria-label="Contact"
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
              Contact
            </span>
          </Link>
        </div>
      ) : (
        <nav
          className={`pointer-events-auto flex items-center p-1 sm:p-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_4px_20px_rgba(6,26,30,0.06)] ${
            isDark
              ? "bg-[#021833]/85 border border-cyan-500/30 text-white"
              : "bg-[#dbd7ca]/85 border border-[#061a1e]/[0.08] text-[#061a1e]"
          }`}
          aria-label="Main Navigation"
        >
          {/* Home Link */}
          <Link
            href="/"
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
              isDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-[#061a1e]/75 hover:text-[#061a1e] hover:bg-black/5"
            }`}
          >
            Home
          </Link>

          {/* Work Link */}
          <Link
            href="/work"
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
              isWork
                ? "bg-[#299093] text-white shadow-sm"
                : isDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-[#061a1e]/75 hover:text-[#061a1e] hover:bg-black/5"
            }`}
          >
            Work
          </Link>

          {/* Contact Link */}
          <Link
            href="/contact"
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-200 ${
              isContact
                ? "bg-[#299093] text-white shadow-sm"
                : isDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-[#061a1e]/75 hover:text-[#061a1e] hover:bg-black/5"
            }`}
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
