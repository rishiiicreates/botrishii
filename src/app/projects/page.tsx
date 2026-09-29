"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UnifiedPortfolioPage from "@/app/page";

export default function ProjectsRoute() {
  const router = useRouter();

  useEffect(() => {
    // Scroll smoothly to projects section if navigating here directly
    const timer = setTimeout(() => {
      const el = document.getElementById("projects");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [router]);

  return <UnifiedPortfolioPage />;
}
