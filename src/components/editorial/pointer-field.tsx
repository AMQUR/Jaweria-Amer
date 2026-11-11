"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";

const VARS = ["--px", "--py", "--mx", "--my", "--tx", "--ty"] as const;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * One scoped pointer listener for a region. Any descendant marked
 * `data-depth="tilt"` receives --px/--py (−1…1) and --mx/--my (%), and
 * `data-depth="magnet"` additionally receives a bounded --tx/--ty in px.
 * CSS decides what those mean, so nothing here touches React state.
 *
 * Mouse only: it never arms on touch/pen, on coarse pointers, or under
 * prefers-reduced-motion, and it clears its variables on leave so the
 * element settles through its own CSS transition.
 */
export function PointerField({
  as = "div",
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: "div" | "ul" | "section" | "span"; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    const clear = (el: HTMLElement) => {
      for (const name of VARS) el.style.removeProperty(name);
    };
    const paint = () => {
      frame = 0;
      if (!target) return;
      const box = target.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const nx = clamp01((x - box.left) / box.width);
      const ny = clamp01((y - box.top) / box.height);
      const style = target.style;
      style.setProperty("--px", (nx * 2 - 1).toFixed(3));
      style.setProperty("--py", (ny * 2 - 1).toFixed(3));
      style.setProperty("--mx", `${(nx * 100).toFixed(1)}%`);
      style.setProperty("--my", `${(ny * 100).toFixed(1)}%`);
      if (target.dataset.depth === "magnet") {
        style.setProperty("--tx", `${((nx * 2 - 1) * 6).toFixed(2)}px`);
        style.setProperty("--ty", `${((ny * 2 - 1) * 4).toFixed(2)}px`);
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const hit = (event.target as Element | null)?.closest<HTMLElement>("[data-depth]") ?? null;
      const next = hit && root.contains(hit) ? hit : null;
      if (next !== target) {
        if (target) clear(target);
        target = next;
      }
      x = event.clientX;
      y = event.clientY;
      if (target && !frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (target) clear(target);
      target = null;
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      if (target) clear(target);
    };
  }, []);

  // One element type at runtime; the cast only quiets the per-tag ref typing.
  const Tag = as as "div";
  return (
    <Tag {...rest} ref={ref as RefObject<HTMLDivElement | null>}>
      {children}
    </Tag>
  );
}
