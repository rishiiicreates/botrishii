"use client";

import React, { useEffect } from "react";
import WorkPage from "@/app/work/page";

export default function AboutRoute() {
  useEffect(() => {
    // Scroll smoothly to about section if navigating here directly
    const timer = setTimeout(() => {
      const el = document.getElementById("about");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return <WorkPage />;
}
