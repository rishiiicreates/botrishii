import React from "react";
import Header from "@/components/Header";
import PatternCanvas from "@/components/PatternCanvas";
import HeroSection from "@/components/HeroSection";
import LearningOnTheJob from "@/components/LearningOnTheJob";
import CapabilitiesStickyScroll from "@/components/CapabilitiesStickyScroll";
import CapabilitiesCarousel from "@/components/CapabilitiesCarousel";
import MissionStatement from "@/components/MissionStatement";
import CareersSection from "@/components/CareersSection";
import OutroSection from "@/components/OutroSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative w-full">
      {/* Global Persistent Interactive Grid & Cursor Animation across the entire UI */}
      <PatternCanvas
        seed={3}
        density={0.5}
        className="fixed inset-0 size-full pointer-events-none z-behind-content"
      />

      {/* Global Minimal Navigation */}
      <Header />

      {/* Sections 0, 1, 2: Hero Banner (3D arm & capsules), Hero Narrative, and Hero 4-Photo Carousel */}
      <HeroSection />

      {/* Section 3: "Our first robots are learning on the job" */}
      <LearningOnTheJob />

      {/* Section 4: "Intelligence on the factory floor" 400lvh Sticky 3D Isometric Factory Scene */}
      <CapabilitiesStickyScroll />

      {/* Section 5: Second Factory Photography Carousel (3 Photos) */}
      <CapabilitiesCarousel />

      {/* Section 6: Mission Statement Section */}
      <MissionStatement />

      {/* Section 7: Careers / Hands on with hardware every day */}
      <CareersSection />

      {/* Section 8: Outro / Get to know Botrishii / Interactive Work ball */}
      <OutroSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
