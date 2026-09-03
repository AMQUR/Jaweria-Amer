"use client";

import { useEffect, type KeyboardEvent, type RefObject } from "react";
import Image from "next/image";
import { ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { PublicResult } from "@/lib/results/public";
import { SESSION_LABEL, gradeTone } from "@/lib/results/public";
import { avatarMark } from "./result-capsule";

/**
 * Result detail. Base UI Dialog supplies the focus trap, Escape, scroll lock
 * and background inerting; `finalFocus` returns focus to the capsule that
 * opened it. Renders only the public-safe fields the dataset carries.
 */
const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Belt-and-braces focus trap: Tab / Shift+Tab cycle inside the popup. */
function cycleTab(e: KeyboardEvent<HTMLDivElement>) {
  if (e.key !== "Tab") return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(TABBABLE)).filter((el) => el.offsetParent !== null);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || !e.currentTarget.contains(active))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || !e.currentTarget.contains(active))) {
    e.preventDefault();
    first.focus();
  }
}

export function ResultDetailDialog({
  result,
  onClose,
  returnFocusRef,
}: {
  result: PublicResult | null;
  onClose: () => void;
  /** Ref holding the capsule that opened the dialog — focus returns there on close. */
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  // Lock page scroll while the detail is open (Base UI handles the rest).
  useEffect(() => {
    if (!result) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [result]);

  return (
    <Dialog open={result !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        finalFocus={returnFocusRef}
        onKeyDown={cycleTab}
        className="results-ink w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-2xl border p-0 ring-0 sm:max-w-md"
        style={{ borderColor: "var(--results-line)" }}
      >
        {result ? (
          <div className="relative">
            <div className="results-grid-texture absolute inset-0" aria-hidden="true" />
            <DialogClose
              aria-label="Close result"
              className="absolute top-2 right-2 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2"
              style={{ color: "var(--results-cream)", ["--tw-ring-color" as string]: "var(--results-pink)" }}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </DialogClose>
            <div className="relative p-5 pt-6 sm:p-7">
              <p className="results-eyebrow pr-12">{SESSION_LABEL} · Cambridge English · {result.id}</p>
              <div className="mt-5 flex items-center gap-4">
                <span className="results-avatar results-avatar-lg" data-anonymous={result.anonymous ? "" : undefined} aria-hidden="true">
                  {result.portraitUrl ? (
                    <Image src={result.portraitUrl} alt="" width={72} height={72} className="h-full w-full object-cover object-top" />
                  ) : (
                    avatarMark(result)
                  )}
                </span>
                <div className="min-w-0">
                  <DialogTitle className="font-serif text-[1.35rem] font-semibold leading-tight tracking-tight" style={{ color: "var(--results-cream)" }}>
                    {result.displayName}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-[13px]" style={{ color: "var(--results-mute)" }}>
                    {result.qualification} · {result.syllabusCode}
                  </DialogDescription>
                </div>
              </div>

              <div
                className="mt-6 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl p-4"
                style={{ background: "var(--results-card)", border: "1px solid var(--results-line)" }}
              >
                <span
                  className="results-metric text-[3rem] font-extrabold leading-none"
                  data-tone={gradeTone(result.grade)}
                  style={{ color: result.grade === "A*" ? "var(--results-pink)" : "var(--results-cream)" }}
                >
                  {result.grade}
                </span>
                <div className="text-[13px] leading-snug" style={{ color: "var(--results-mute)" }}>
                  <p className="font-semibold" style={{ color: "var(--results-cream)" }}>Cambridge grade in English</p>
                  <p>Submitted by the student with a screenshot of their statement of results on file.</p>
                </div>
              </div>

              <p className="mt-5 flex items-start gap-2 text-[12px]" style={{ color: "var(--results-mute)" }}>
                <ShieldCheck className="mt-0.5 size-4 shrink-0" style={{ color: "var(--results-pink-2)" }} aria-hidden="true" />
                <span>
                  {result.anonymous
                    ? "Shared with permission — the student asked us to withhold their name."
                    : "Shared with the student's permission."}{" "}
                  <Link href="/results#methodology" className="underline underline-offset-4 hover:text-white" style={{ color: "var(--results-pink-2)" }}>
                    How these figures were calculated
                  </Link>
                </span>
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
