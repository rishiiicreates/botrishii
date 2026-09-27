"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PatternCanvas from "@/components/PatternCanvas";
import FanTag from "@/components/FanTag";
import { Copy, Check, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText("Palo Alto, CA");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen flex flex-col relative w-full justify-between">
      {/* Interactive Grid & Ambient Canvas Background */}
      <PatternCanvas
        seed={3}
        density={0.5}
        className="fixed inset-0 size-full pointer-events-none z-behind-content"
      />

      {/* Global Minimal Navigation */}
      <Header />

      {/* Main Contact Stage */}
      <section className="px-6 md:px-12 pt-36 md:pt-44 pb-20 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-[#e8e5e0] border border-[#061a1e]/[0.08] rounded-[3.2rem] md:rounded-[4.2rem] p-8 md:p-14 shadow-[0_24px_64px_rgba(6,26,30,0.12)] flex flex-col gap-8 text-[#061a1e]">
          {/* Header & Technical Tags */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#dbd7ca] text-[#061a1e] font-semibold">
                Mind Robotics
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#dbd7ca] text-[#061a1e] font-semibold">
                Palo Alto, CA
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#061a1e] mt-1">
              Contact us
            </h1>
            <p className="text-base md:text-lg text-[#061a1e]/70 leading-relaxed">
              We are building universally capable robotics for physical industrial labor. Reach out to discuss partnerships, press, or hardware deployment.
            </p>
          </div>

          {/* Details List */}
          <dl className="flex flex-col gap-5 pt-4 border-t border-[#061a1e]/10">
            {/* Address */}
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/50 dark:text-white/50 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#299093]" />
                Address
              </dt>
              <dd className="text-lg font-semibold text-[#061a1e] dark:text-[#f6f4f0]">
                Palo Alto, CA
              </dd>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/50 dark:text-white/50 flex items-center gap-1.5">
                <Phone className="size-3.5 text-[#ffbd00]" />
                Phone
              </dt>
              <dd>
                <a
                  href="tel:+14084599351"
                  className="text-lg font-semibold text-[#061a1e] dark:text-[#f6f4f0] hover:text-[#299093] transition-colors"
                >
                  408-459-9351
                </a>
              </dd>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-mono uppercase tracking-wider text-[#061a1e]/50 dark:text-white/50 flex items-center gap-1.5">
                <Mail className="size-3.5 text-[#ef6156]" />
                Email
              </dt>
              <dd>
                <a
                  href="mailto:press@mindrobotics.com"
                  className="text-lg font-semibold text-[#061a1e] dark:text-[#f6f4f0] hover:text-[#299093] transition-colors truncate block"
                >
                  press@mindrobotics.com
                </a>
              </dd>
            </div>
          </dl>

          {/* Action CTAs with 3-Layer Waterfall */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Send email */}
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
              <span className="relative z-10 px-6 text-center leading-none">
                Send email
              </span>
            </a>

            {/* Copy Address */}
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
              <span className="relative z-10 px-6 text-center leading-none">
                {copied ? "Address Copied!" : "Copy Address"}
              </span>
            </button>

            {/* Back to Home */}
            <Link
              href="/"
              className="flex items-center gap-2 px-5 h-11 rounded-full text-sm font-semibold border border-[#061a1e]/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-[#061a1e] dark:text-[#f6f4f0] transition-colors ml-auto"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
