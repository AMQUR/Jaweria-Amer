"use client";

import { useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";

const SECTION_MAP: Record<string, string> = {
  "general-notes": "notes-section",
  topicals: "topicals-section",
  yearlies: "yearlies-section",
  scripts: "scripts-section",
  marking: "marking-section",
  worksheets: "worksheets-section",
  vocab: "vocab-section",
  "yearly-past-papers": "yearlies-section",
  "examiner-reports": "scripts-section",
  checklists: "marking-section",
  "quick-worksheets": "worksheets-section",
  vocabulary: "vocab-section",
};

export function useScrollToSection() {
  const params = useSearchParams();
  const cat = params.get("cat") || "";

  useLayoutEffect(() => {
    const id = SECTION_MAP[cat];
    if (!id) return;

    let frame = 0;
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      if (attempts < 10) {
        attempts++;
        frame = requestAnimationFrame(tryScroll);
      }
    };

    frame = requestAnimationFrame(tryScroll);

    return () => cancelAnimationFrame(frame);
  }, [cat]);
}
