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
        <div
          className="w-full max-w-[94vw] md:w-[68vw] lg:w-[66vw] max-w-5xl bg-[#e8e5e0] border border-[#061a1e]/[0.08] rounded-[3.6rem] md:rounded-[4.8rem] p-10 md:p-14 lg:p-16 shadow-[0_32px_80px_rgba(6,26,30,0.14)] flex flex-col justify-between text-[#061a1e]"
          style={{ minHeight: "75vh" }}
        >
          {/* Header & Technical Tags */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
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

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#061a1e]">
              Contact us
            </h1>
            <p className="text-lg md:text-2xl text-[#061a1e]/70 leading-relaxed max-w-2xl text-balance">
              We are building universally capable robotics for physical industrial labor. Reach out to discuss commercial deployments, press inquiries, or hardware partnerships.
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

          {/* Action CTAs with 3-Layer Waterfall */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Send email */}
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
              <span className="relative z-10 px-8 text-center leading-none">
                Send email
              </span>
            </a>

            {/* Copy Address */}
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

            {/* Back to Home */}
            <Link
              href="/"
              className="flex items-center gap-2 px-6 h-12 md:h-14 rounded-full text-base font-semibold border border-[#061a1e]/15 hover:bg-black/5 text-[#061a1e] transition-colors ml-auto"
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
