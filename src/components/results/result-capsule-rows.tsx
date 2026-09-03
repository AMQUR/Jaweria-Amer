"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import type { PublicResult } from "@/lib/results/public";
import { ResultCapsule } from "./result-capsule";
import { ResultDetailDialog } from "./result-detail-dialog";

/**
 * Professional pacing in effective pixels per second, by viewport width.
 * Desktop ≈ 28, tablet ≈ 25, mobile ≈ 21; rows differ only slightly so they
 * never race. Duration = measured segment width ÷ speed, so the pace is the
 * same regardless of how many results a row holds.
 */
export const BASE_SPEED_PX_PER_SECOND = { mobile: 21, tablet: 25, desktop: 28 } as const;
export const ROW_SPEED_FACTORS = [1, 0.93, 1.035] as const;

export function baseSpeedFor(viewportWidth: number): number {
  if (viewportWidth < 640) return BASE_SPEED_PX_PER_SECOND.mobile;
  if (viewportWidth < 1024) return BASE_SPEED_PX_PER_SECOND.tablet;
  return BASE_SPEED_PX_PER_SECOND.desktop;
}

export function rowSpeedFor(viewportWidth: number, rowIndex: number): number {
  return Math.round(baseSpeedFor(viewportWidth) * ROW_SPEED_FACTORS[rowIndex % ROW_SPEED_FACTORS.length] * 10) / 10;
}

export const ROW_DIRECTIONS = ["left", "right", "left"] as const;

/**
 * Seamless loop with minimal DOM: each track is [full segment][partial copy of
 * its first capsules] and travels exactly one full-segment width per loop.
 * The copy only has to be wider than the widest viewport we serve, so 20
 * capsules (≈ 4,000px+) is plenty; nothing else is duplicated.
 */
export const LOOP_TAIL_COUNT = 20;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Three moving rows of real results.
 *  - CSS transform animation only (no per-frame React state, no JS timers —
 *    nothing can double up after navigation or tab switches).
 *  - Each track holds one full segment plus a short copy of its first capsules
 *    and travels exactly one full-segment width per loop, so the repeat
 *    boundary is invisible without duplicating every result.
 *  - Pauses on hover / focus-within (CSS), while the detail dialog is open and
 *    while the block is offscreen (data-paused). Resumes from the same spot.
 *  - Reduced motion → CSS turns each row into a static wrapped grid and hides
 *    the duplicate segment; every result and every interaction remains.
 */
export function ResultCapsuleRows({ rows }: { rows: PublicResult[][] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState<PublicResult | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = (r: PublicResult, opener: HTMLElement) => {
    openerRef.current = opener;
    setSelected(r);
  };

  // Set each row's duration from its real segment width so speed is px/sec.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tracks = Array.from(root.querySelectorAll<HTMLElement>("[data-results-track]"));
    const apply = () => {
      const vw = window.innerWidth;
      tracks.forEach((track, i) => {
        const segment = track.querySelector<HTMLElement>("[data-results-segment]");
        if (!segment) return;
        const speed = rowSpeedFor(vw, i);
        const distance = segment.offsetWidth;
        if (!distance) return;
        track.style.setProperty("--results-loop", `${distance}px`);
        track.style.setProperty("--results-duration", `${(distance / speed).toFixed(2)}s`);
        track.dataset.pxPerSecond = String(speed);
        track.dataset.segmentWidth = String(Math.round(distance));
      });
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(root);
    tracks.forEach((t) => {
      const seg = t.querySelector<HTMLElement>("[data-results-segment]");
      if (seg) ro.observe(seg);
    });
    return () => ro.disconnect();
  }, []);

  // Offload the animation while the block is well offscreen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = !visible || selected !== null;

  /**
   * Keyboard users: rows are `overflow: clip` (no scroll container), so when a
   * capsule outside the visible band receives focus we seek the row's own CSS
   * animation (Web Animations API) until that capsule sits in the reading zone.
   * The row is already paused by :focus-within; on blur it resumes from here.
   */
  const onRowFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const row = e.currentTarget;
    const capsule = (e.target as HTMLElement).closest<HTMLElement>("[data-result-capsule]");
    const track = row.querySelector<HTMLElement>("[data-results-track]");
    const segment = track?.querySelector<HTMLElement>("[data-results-segment]");
    if (!capsule || !track || !segment) return;
    const segmentWidth = segment.offsetWidth;
    const rowRect = row.getBoundingClientRect();
    const capRect = capsule.getBoundingClientRect();
    const band = rowRect.width * 0.08;
    if (!segmentWidth || (capRect.left >= rowRect.left + band && capRect.right <= rowRect.right - band)) return;
    const animation = track.getAnimations().find((a) => a instanceof CSSAnimation && a.animationName.startsWith("results-marquee"));
    const duration = animation?.effect?.getTiming().duration;
    if (!animation || typeof duration !== "number" || !duration) return;
    // Layout offset of the capsule inside the track (both share the transform).
    const offset = capRect.left - track.getBoundingClientRect().left;
    const margin = Math.min(rowRect.width * 0.2, 160);
    const translate = Math.max(-segmentWidth, Math.min(0, margin - offset));
    const progress = track.dataset.direction === "left" ? -translate / segmentWidth : (translate + segmentWidth) / segmentWidth;
    // progress 1 is the same frame as 0 (loop boundary) — stay ~1px inside the iteration.
    animation.currentTime = Math.min(progress, 1 - 1 / segmentWidth) * duration;
  };

  return (
    <div ref={rootRef} className="space-y-3" data-results-rows="">
      {rows.map((row, i) => (
        <div key={i} className="results-row" data-results-row={i + 1} onFocus={onRowFocus}>
          <div
            className="results-track"
            data-results-track=""
            data-direction={ROW_DIRECTIONS[i % ROW_DIRECTIONS.length]}
            data-paused={paused ? "true" : "false"}
          >
            <div className="results-segment" data-results-segment="">
              {row.map((r) => (
                <ResultCapsule key={r.id} result={r} onOpen={open} />
              ))}
            </div>
            <div className="results-segment" data-results-tail="" data-dup="" aria-hidden="true">
              {row.slice(0, LOOP_TAIL_COUNT).map((r) => (
                <ResultCapsule key={`${r.id}-dup`} result={r} onOpen={open} dup />
              ))}
            </div>
          </div>
        </div>
      ))}
      <ResultDetailDialog result={selected} onClose={() => setSelected(null)} returnFocusRef={openerRef} />
    </div>
  );
}
