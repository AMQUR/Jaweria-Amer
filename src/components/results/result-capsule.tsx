"use client";

import Image from "next/image";
import type { PublicResult } from "@/lib/results/public";
import { gradeTone } from "@/lib/results/public";

/** Initials for a named record; the archive number for an anonymised one. */
export function avatarMark(r: PublicResult): string {
  if (r.anonymous) return String(r.archiveNumber).padStart(3, "0");
  const parts = r.displayName.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function ResultAvatar({ result }: { result: PublicResult }) {
  return (
    <span className="results-avatar" data-anonymous={result.anonymous ? "" : undefined} aria-hidden="true">
      {result.portraitUrl ? (
        <Image src={result.portraitUrl} alt="" width={40} height={40} className="h-full w-full object-cover object-top" loading="lazy" />
      ) : (
        avatarMark(result)
      )}
    </span>
  );
}

export function GradeBadge({ grade, className = "" }: { grade: PublicResult["grade"]; className?: string }) {
  return (
    <span className={`results-grade ${className}`} data-tone={gradeTone(grade)}>
      {grade}
    </span>
  );
}


export function ResultCapsule({
  result,
  onOpen,
  dup = false,
}: {
  result: PublicResult;
  onOpen: (r: PublicResult, opener: HTMLElement) => void;
  /** Seamless-loop duplicate: hidden from assistive tech and the tab order. */
  dup?: boolean;
}) {
  return (
    <button
      type="button"
      className="results-capsule"
      data-result-capsule=""
      data-dup={dup ? "" : undefined}
      onClick={(e) => onOpen(result, e.currentTarget)}
      tabIndex={dup ? -1 : undefined}
    >
      <ResultAvatar result={result} />
      <span className="flex flex-col">
        <span className="results-capsule-name">{result.displayName}</span>
        <span className="results-capsule-meta">
          <span className="results-grade-text" data-tone={gradeTone(result.grade)}>{result.grade}</span>
          {" · "}
          {result.syllabusCode}
        </span>
      </span>
      {dup ? null : <span className="sr-only">{`, grade ${result.grade}, ${result.qualification}${result.anonymous ? ", name withheld" : ""}. Open result ${result.id}`}</span>}
    </button>
  );
}
