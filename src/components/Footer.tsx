"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [privacyChoiceActive, setPrivacyChoiceActive] = useState(false);

  return (
    <footer className="laptop:px-8 px-gutter-outer py-[var(--footer-padding-block)] mt-auto">
      <div className="bg-[#f6f4f0] rounded-[2.4rem] tablet:items-center tablet:px-7 tablet:py-3 laptop:gap-16 laptop:rounded-full laptop:px-8 laptop:py-4 flex items-start justify-between gap-4 p-6 text-[#061a1e]">
        {/* Monogram Logo */}
        <Link
          href="/"
          className="group focus:outline-none shrink-0"
          aria-label="Go to Rishii home"
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

        {/* Content Bar */}
        <div className="text-paragraph-small tablet:flex-row tablet:items-start tablet:gap-10 laptop:flex-1 laptop:items-center laptop:justify-between laptop:gap-4 flex flex-col gap-3">
          <ul className="tablet:gap-2 laptop:flex-row laptop:gap-10 flex flex-col gap-3">
            <li className="flex items-center gap-2">
              <svg className="size-5 shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="currentColor" d="M10.949 9.498q.39-.39.39-.95t-.39-.95-.95-.39q-.562 0-.95.39-.39.39-.39.95t.39.95q.388.39.95.39.56 0 .95-.39m-.95 6.66q2.382-2.086 3.71-4.065 1.33-1.98 1.33-3.49 0-2.196-1.428-3.653-1.426-1.458-3.613-1.458-2.185 0-3.613 1.458T4.958 8.603q0 1.51 1.329 3.49t3.711 4.064m0 1.433q-3.063-2.6-4.594-4.844-1.53-2.244-1.53-4.144 0-2.551 1.71-4.369t4.413-1.817q2.683 0 4.404 1.817 1.72 1.818 1.72 4.369 0 1.9-1.52 4.134-1.52 2.233-4.604 4.854" />
              </svg>
              <span>Delhi NCR, India</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="size-5 shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="currentColor" d="M6.258 18.583q-.555 0-.948-.392a1.3 1.3 0 0 1-.392-.947V2.757q0-.632.354-.986t.986-.354h7.519q.554 0 .947.392.393.393.393.948v3.048a.82.82 0 0 1 .676.191.78.78 0 0 1 .292.624v1.904q0 .377-.292.624a.82.82 0 0 1-.676.192v7.904q0 .554-.393.947a1.3 1.3 0 0 1-.947.392zm0-1.083h7.519a.25.25 0 0 0 .184-.072.25.25 0 0 0 .072-.184V2.757a.25.25 0 0 0-.072-.185.25.25 0 0 0-.184-.072h-7.52a.25.25 0 0 0-.184.072.25.25 0 0 0-.072.185v14.487a.25.25 0 0 0 .072.184.25.25 0 0 0 .185.072m4.222-1.507a.62.62 0 0 0 .191-.463.643.643 0 0 0-.65-.658.643.643 0 0 0-.657.65.643.643 0 0 0 .649.658q.277 0 .467-.187" />
              </svg>
              <a href="tel:+918960548709" className="hover:text-[#299093] transition-colors duration-200">
                +91 8960548709
              </a>
            </li>
            <li className="flex items-center gap-2">
              <svg className="size-5 shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="currentColor" d="M3.758 15.583q-.563 0-.951-.388a1.3 1.3 0 0 1-.389-.952V5.75q0-.564.389-.949a1.3 1.3 0 0 1 .95-.385h12.488q.563 0 .951.389.39.389.389.951v8.493q0 .563-.389.948a1.3 1.3 0 0 1-.951.385zM10 10.632 3.5 6.806v7.438a.25.25 0 0 0 .072.184.25.25 0 0 0 .185.072h12.487a.25.25 0 0 0 .184-.072.25.25 0 0 0 .072-.184V6.806zm0-1.403L16.373 5.5H3.63zM3.5 6.806V5.5v8.744a.25.25 0 0 0 .072.184.25.25 0 0 0 .185.072H3.5z" />
              </svg>
              <a href="mailto:rishiicreates@gmail.com" className="hover:text-[#299093] transition-colors duration-200">
                rishiicreates@gmail.com
              </a>
            </li>
          </ul>

          <div className="tablet:gap-2 laptop:flex-row laptop:gap-8 flex flex-col gap-3">
            <nav>
              <ul className="tablet:gap-2 laptop:flex-row laptop:gap-8 flex flex-col gap-3">
                <li>
                  <Link href="#privacy" className="hover:text-[#299093] transition-colors duration-200">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="hover:text-[#299093] transition-colors duration-200">
                    Terms
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setPrivacyChoiceActive(!privacyChoiceActive)}
                    className="hover:text-[#299093] cursor-pointer text-left transition-colors duration-200"
                  >
                    Your Privacy Choices
                  </button>
                </li>
              </ul>
            </nav>
            <p>© Rishii 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
