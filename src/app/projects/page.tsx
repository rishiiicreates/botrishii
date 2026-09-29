"use client";

import React, { useEffect } from "react";
import WorkPage from "@/app/work/page";

export default function ProjectsRoute() {
  useEffect(() => {
    // Scroll smoothly to projects section if navigating here directly
    const timer = setTimeout(() => {
      const el = document.getElementById("projects");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return <WorkPage />;
}
