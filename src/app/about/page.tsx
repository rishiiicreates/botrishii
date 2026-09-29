"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UnifiedPortfolioPage from "@/app/page";

export default function AboutRoute() {
  const router = useRouter();

  useEffect(() => {
    // Scroll smoothly to about section if navigating here directly
    const timer = setTimeout(() => {
      const el = document.getElementById("about");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [router]);

  return <UnifiedPortfolioPage />;
}
