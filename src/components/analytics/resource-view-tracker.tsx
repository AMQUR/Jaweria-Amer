"use client";

import { useEffect } from "react";
import { trackResourceView } from "@/lib/analytics";

export function ResourceViewTracker({ id, title }: { id: string; title: string }) {
  useEffect(() => {
    trackResourceView(id, title, { interaction: "viewer" });
  }, [id, title]);
  return null;
}
