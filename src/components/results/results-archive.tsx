"use client";

import { useMemo, useRef, useState } from "react";
import type { GradeLabel, PublicResult } from "@/lib/results/public";
import { ResultCapsule } from "./result-capsule";
import { ResultDetailDialog } from "./result-detail-dialog";

const FILTERS: Array<{ key: string; label: string; match: (r: PublicResult) => boolean }> = [
  { key: "all", label: "All", match: () => true },
  { key: "astar", label: "A*", match: (r) => r.grade === "A*" },
  { key: "a", label: "A", match: (r) => r.grade === "A" },
  { key: "b", label: "B", match: (r) => r.grade === "B" },
  { key: "other", label: "C – U", match: (r) => !(["A*", "A", "B"] as GradeLabel[]).includes(r.grade) },
];

/**
 * Static, non-moving list of every shared result — the always-available
 * path to each record (no animation required). Grouped by grade filter.
 */
export function ResultsArchive({ records }: { records: PublicResult[] }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<PublicResult | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const shown = useMemo(() => records.filter(active.match), [records, active]);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter results by grade">
        {FILTERS.map((f) => {
          const count = records.filter(f.match).length;
          const isActive = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(f.key)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2"
              style={{
                borderColor: isActive ? "var(--results-pink)" : "var(--results-line)",
                background: isActive ? "var(--results-pink)" : "var(--results-card)",
                color: isActive ? "var(--results-bg)" : "var(--results-cream)",
                ["--tw-ring-color" as string]: "var(--results-pink)",
              }}
            >
              {f.label}
              <span className="tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px]" style={{ color: "var(--results-mute)" }} aria-live="polite">
        Showing {shown.length} of {records.length} shared results.
      </p>
      <ul className="mt-6 flex flex-wrap gap-3" aria-label="Shared May/June 2026 results">
        {shown.map((r) => (
          <li key={r.id} className="max-w-full">
            <ResultCapsule
              result={r}
              onOpen={(res, opener) => {
                openerRef.current = opener;
                setSelected(res);
              }}
            />
          </li>
        ))}
      </ul>
      <ResultDetailDialog result={selected} onClose={() => setSelected(null)} returnFocusRef={openerRef} />
    </div>
  );
}
