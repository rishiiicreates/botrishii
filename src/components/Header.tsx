"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Copy, Check, X, Moon, Sun } from "lucide-react";

export default function Header() {
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme as "dark" | "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

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
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center size-10 rounded-full border border-current/20 bg-black/10 dark:bg-white/5 backdrop-blur-md text-current hover:border-current/50 transition-colors"
            title={`Switch to ${theme === "dark" ? "Studio Warm" : "Dark Industrial"} theme`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4.5 text-[#ffbd00]" />
            ) : (
              <Moon className="size-4.5 text-[#299093]" />
            )}
          </button>

          {/* Join Us CTA */}
          <a
            href="https://jobs.ashbyhq.com/mindrobotics"
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

      {/* Contact Modal Dialog */}
      {contactOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setContactOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[2.4rem] border border-black/10 dark:border-white/20 bg-[#f6f4f0] dark:bg-[#0a1a1e] p-8 shadow-2xl text-[#061a1e] dark:text-[#f6f4f0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10">
              <h3 className="text-2xl font-bold tracking-tight">Contact Us</h3>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="size-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              {/* Address */}
              <div className="flex items-start justify-between p-4 rounded-2xl bg-white dark:bg-[#061417] border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-[#299093]" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/50 dark:text-white/50 font-mono">
                      Location
                    </p>
                    <p className="font-semibold text-lg">Palo Alto, CA</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#061417] border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-[#ffbd00]" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/50 dark:text-white/50 font-mono">
                      Telephone
                    </p>
                    <a
                      href="tel:+14084599351"
                      className="font-semibold text-lg hover:text-[#299093] transition-colors"
                    >
                      408-459-9351
                    </a>
                  </div>
                </div>
                <a
                  href="tel:+14084599351"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#299093] text-white hover:bg-[#207477] transition-colors"
                >
                  Call
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#061417] border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-[#ef6156]" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-black/50 dark:text-white/50 font-mono">
                      Press & Inquiries
                    </p>
                    <a
                      href="mailto:press@mindrobotics.com"
                      className="font-semibold text-lg hover:text-[#299093] transition-colors"
                    >
                      press@mindrobotics.com
                    </a>
                  </div>
                </div>
                <a
                  href="mailto:press@mindrobotics.com"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#ef6156] text-white hover:bg-[#d44d42] transition-colors"
                >
                  Send
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
