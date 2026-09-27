"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Check } from "lucide-react";

export default function Footer() {
  const [privacyChoiceActive, setPrivacyChoiceActive] = useState(false);

  return (
    <footer className="w-full px-6 md:px-12 py-12 md:py-16 mt-auto">
      {/* Pill Capsule Container */}
      <div className="w-full rounded-[2.5rem] lg:rounded-full bg-[#f6f4f0] dark:bg-[#0a1a1e] border border-black/10 dark:border-white/10 p-6 md:px-10 md:py-5 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 shadow-sm text-[#061a1e] dark:text-[#f6f4f0]">
        {/* Monogram Logo */}
        <Link
          href="/"
          className="group focus:outline-none shrink-0"
          aria-label="Go to Mind Robotics Home"
        >
          <svg
            className="h-8 w-auto text-current transition-transform duration-300 group-hover:scale-105"
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
              d="M27.2 20.485c0 7.07 5.73 12.8 12.8 12.8s12.8-5.73 12.8-12.8-5.73-12.8-12.8-12.8-12.8 5.73-12.8 12.8Z"
            />
            <path
              fill="currentColor"
              d="M80 51.2V12.8C80 5.73 74.27 0 67.2 0c-7.069 0-12.8 5.73-12.8 12.8v38.4c0 7.07 5.731 12.8 12.8 12.8C74.27 64 80 58.27 80 51.2Z"
            />
          </svg>
        </Link>

        {/* Contact Info Group */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-xs md:text-sm font-medium">
          {/* Location */}
          <div className="flex items-center gap-2 opacity-80">
            <MapPin className="size-4 text-[#299093]" />
            <span>Palo Alto, CA</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-[#ffbd00]" />
            <a
              href="tel:+14084599351"
              className="hover:text-[#299093] transition-colors"
            >
              408-459-9351
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-[#ef6156]" />
            <a
              href="mailto:press@mindrobotics.com"
              className="hover:text-[#299093] transition-colors"
            >
              press@mindrobotics.com
            </a>
          </div>
        </div>

        {/* Legal & Copyright Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs opacity-75 font-medium">
          <Link href="#privacy" className="hover:text-[#299093] transition-colors">
            Privacy
          </Link>
          <Link href="#terms" className="hover:text-[#299093] transition-colors">
            Terms
          </Link>
          <button
            type="button"
            onClick={() => setPrivacyChoiceActive(!privacyChoiceActive)}
            className="hover:text-[#299093] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Your Privacy Choices</span>
            {privacyChoiceActive && <Check className="size-3 text-emerald-500" />}
          </button>
          <span className="opacity-60">© Mind Robotics 2026</span>
        </div>
      </div>
    </footer>
  );
}
