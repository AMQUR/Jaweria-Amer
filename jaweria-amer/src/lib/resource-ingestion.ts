import type { Resource, ResourceHubCategory, ResourceNotesSubCategory } from "./data";

const NOISE_FILENAME_TOKENS = new Set([
  "copy",
  "final",
  "finalv2",
  "v2",
  "v3",
  "version",
  "new",
  "updated",
  "edited",
  "revised",
]);

/** Maps on-disk folder names under `public/resources/` to hub categories. */
export const RESOURCE_FOLDER_TO_CATEGORY: Record<string, ResourceHubCategory> = {
  notes: "general-notes",
  worksheets: "topical-worksheets",
  "past-papers": "yearly-past-papers",
  "examiner-reports": "examiner-reports",
  checklists: "checklists",
};

export function hubCategoryForDiskFolder(folder: string): ResourceHubCategory {
  return RESOURCE_FOLDER_TO_CATEGORY[folder] ?? "topical-worksheets";
}

export function basenameFromFileUrl(fileUrl: string): string {
  const clean = fileUrl.split("?")[0] ?? fileUrl;
  const parts = clean.split("/");
  return parts[parts.length - 1] ?? clean;
}

export function normalizeFilenameKey(name: string): string {
  const base = name.replace(/\.[a-z0-9]+$/i, "").toLowerCase();
  const noParens = base.replace(/\(\s*\d+\s*\)/g, " ");
  const spaced = noParens.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const tokens = spaced
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .filter((t) => !NOISE_FILENAME_TOKENS.has(t));
  return tokens.join(" ");
}

/** Sørensen–Dice on bigrams for robust short-string similarity. */
export function titleSimilarity(a: string, b: string): number {
  const bigrams = (s: string) => {
    const t = s.toLowerCase().replace(/\s+/g, " ").trim();
    if (t.length < 2) return new Map([[t, 1]]);
    const m = new Map<string, number>();
    for (let i = 0; i < t.length - 1; i++) {
      const bg = t.slice(i, i + 2);
      m.set(bg, (m.get(bg) ?? 0) + 1);
    }
    return m;
  };
  const A = bigrams(a);
  const B = bigrams(b);
  let intersection = 0;
  for (const [k, v] of A) {
    const w = B.get(k);
    if (w) intersection += Math.min(v, w);
  }
  const total = [...A.values()].reduce((s, v) => s + v, 0) + [...B.values()].reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  return (2 * intersection) / total;
}

function normalizeMetaPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9/]/g, "")
    .trim();
}

export type DuplicateReason = "filename" | "session_paper_subject";

export function resourceDuplicateAgainst(
  candidate: Pick<Resource, "title" | "fileUrl" | "year" | "paper" | "subject">,
  existing: Resource
): DuplicateReason | null {
  const cBase = normalizeFilenameKey(basenameFromFileUrl(candidate.fileUrl));
  const eBase = normalizeFilenameKey(basenameFromFileUrl(existing.fileUrl));
  if (cBase.length > 0 && cBase === eBase) return "filename";

  const cFp = caieLooseFingerprint(candidate.fileUrl);
  const eFp = caieLooseFingerprint(existing.fileUrl);
  if (cFp && eFp && cFp === eFp) return "filename";

  const y = normalizeMetaPart(candidate.year);
  const p = normalizeMetaPart(candidate.paper);
  const s = normalizeMetaPart(candidate.subject);
  const isLoosePracticeYear = y === "practice" || y === "mixed" || y === "current";
  if (y && p && s && !isLoosePracticeYear) {
    if (
      y === normalizeMetaPart(existing.year) &&
      p === normalizeMetaPart(existing.paper) &&
      s === normalizeMetaPart(existing.subject)
    ) {
      const sim = titleSimilarity(candidate.title, existing.title);
      if (sim >= 0.92) return "session_paper_subject";
    }
  }

  return null;
}

export function findFirstDuplicate(
  candidate: Pick<Resource, "title" | "fileUrl" | "year" | "paper" | "subject">,
  existing: readonly Resource[]
): { resource: Resource; reason: DuplicateReason } | null {
  for (const r of existing) {
    const reason = resourceDuplicateAgainst(candidate, r);
    if (reason) return { resource: r, reason };
  }
  return null;
}

/** Match title + filename (stem) against phrase rules; order avoids ambiguous double hits. */
export function inferGeneralNotesSubCategory(
  resource: Pick<Resource, "title" | "fileUrl">
): ResourceNotesSubCategory | undefined {
  const stem = basenameFromFileUrl(resource.fileUrl).replace(/\.[a-z0-9]+$/i, "");
  const haystack = `${resource.title} ${stem}`.toLowerCase().replace(/[-_]+/g, " ");

  if (haystack.includes("directed writing")) return "directed-writing";
  if (haystack.includes("comprehension")) return "comprehension";
  if (haystack.includes("summary")) return "summary-writing";
  if (haystack.includes("essay")) return "essay-writing";
  if (haystack.includes("grammar")) return "grammar";
  return undefined;
}

/**
 * Drops later duplicates (same normalized basename or very similar title + same session tuple).
 * Preserves first occurrence order.
 */
export function finalizeResourcesForSite(items: readonly Resource[]): Resource[] {
  const out: Resource[] = [];
  const seenBasenames = new Set<string>();
  const seenIds = new Set<string>();

  for (const item of items) {
    if (seenIds.has(item.id)) {
      logDuplicateSkipped(`id:${item.id}`, "duplicate id");
      continue;
    }
    const bn = normalizeFilenameKey(basenameFromFileUrl(item.fileUrl));
    if (bn.length > 0 && seenBasenames.has(bn)) {
      logDuplicateSkipped(basenameFromFileUrl(item.fileUrl), "normalized filename");
      continue;
    }

    seenIds.add(item.id);
    if (bn.length > 0) seenBasenames.add(bn);
    const enriched: Resource =
      item.category === "general-notes" && item.subCategory === undefined
        ? { ...item, subCategory: inferGeneralNotesSubCategory(item) }
        : item;
    out.push(enriched);
  }
  return out;
}

function logDuplicateSkipped(filename: string, kind: string) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[resources] Duplicate skipped (${kind}): ${filename}`);
  }
}

export type CaieDocKind = "qp" | "ms" | "insert" | "er" | "ecr" | "other";

function parseCaieSession(n: string): { code: string; sessionLabel: string } | null {
  const m = n.match(/(\d{4})[_-]?([sw])(\d{2})/i);
  if (!m) return null;
  const code = m[1] ?? "";
  const season = (m[2] ?? "").toLowerCase();
  const yy = m[3] ?? "";
  const yearFull = 2000 + parseInt(yy, 10);
  const sessionLabel =
    season === "s" ? `May/June ${yearFull}` : season === "w" ? `Nov ${yearFull}` : "";
  if (!sessionLabel) return null;
  return { code, sessionLabel };
}

/** CAIE-style codes: 1123_s24_qp_21, 1123-w24-ms-11.pdf, 1123-w24-examiner-report.pdf */
export function inferCaieFromBasename(base: string): {
  code: string | null;
  sessionLabel: string | null;
  docKind: CaieDocKind;
  variant: string | null;
} {
  const n = base.toLowerCase().replace(/\.pdf$/i, "");
  const m = n.match(/(\d{4})[_-]?([sw])(\d{2})[_-]?(qp|ms|insert|er|ecr)(?:[_-](\d{2}))?/i);
  if (m) {
    const code = m[1] ?? null;
    const season = (m[2] ?? "").toLowerCase();
    const yy = m[3] ?? "";
    const yearFull = 2000 + parseInt(yy, 10);
    const sessionLabel =
      season === "s" ? `May/June ${yearFull}` : season === "w" ? `Nov ${yearFull}` : null;
    const dk = (m[4] ?? "").toLowerCase();
    const docKind: CaieDocKind =
      dk === "qp"
        ? "qp"
        : dk === "ms"
          ? "ms"
          : dk === "insert"
            ? "insert"
            : dk === "er"
              ? "er"
              : dk === "ecr"
                ? "ecr"
                : "other";
    const variant = m[5] ?? null;
    return { code, sessionLabel, docKind, variant };
  }

  const session = parseCaieSession(n);
  if (session) {
    if (/examiner-report|_er\.|principal.*examiner.*report/.test(n)) {
      return { code: session.code, sessionLabel: session.sessionLabel, docKind: "er", variant: null };
    }
    if (/examiner-candidate-responses|candidate-responses|_ecr/i.test(n)) {
      let mark: string | null = null;
      if (/(?:^|[-_])p1\b|paper\s*1/i.test(n)) mark = "p1";
      else if (/(?:^|[-_])p2\b|paper\s*2/i.test(n)) mark = "p2";
      return {
        code: session.code,
        sessionLabel: session.sessionLabel,
        docKind: "ecr",
        variant: mark,
      };
    }
  }

  return { code: null, sessionLabel: null, docKind: "other", variant: null };
}

/** Stable key for matching official packs to Drive renames (same session + document class + variant). */
export function caieLooseFingerprint(fileUrlOrName: string): string | null {
  const base = basenameFromFileUrl(fileUrlOrName);
  const n = base.toLowerCase();
  const i = inferCaieFromBasename(base);
  if (!i.sessionLabel || i.docKind === "other") return null;
  let v = i.variant ?? "";
  if (i.docKind === "ecr") {
    if (!v) {
      if (/(?:^|[-_])p1\b|paper\s*1/i.test(n)) v = "p1";
      else if (/(?:^|[-_])p2\b|paper\s*2/i.test(n)) v = "p2";
    }
  } else if ((i.docKind === "qp" || i.docKind === "ms" || i.docKind === "insert") && !v) {
    const d = n.match(/(?:qp|ms|insert)[_-](\d{2})\b/i);
    if (d) v = d[1] ?? "";
  }
  return `${i.code ?? ""}|${i.sessionLabel}|${i.docKind}|${v}`;
}

function docKindLabel(kind: CaieDocKind): string {
  const labels: Record<CaieDocKind, string> = {
    qp: "Question Paper",
    ms: "Mark Scheme",
    insert: "Insert",
    er: "Principal Examiner Report",
    ecr: "Examiner Candidate Responses",
    other: "Resource",
  };
  return labels[kind] ?? "Resource";
}

export function paperLabelFromVariant(variant: string | null, docKind: CaieDocKind): string {
  if (!variant || variant.length < 1) return "";
  const paperNum = variant[0];
  const paperName = paperNum === "1" ? "Paper 1" : paperNum === "2" ? "Paper 2" : `Paper ${paperNum}`;
  if (docKind === "insert") return `${paperName} insert`;
  return `${paperName} (variant ${variant})`;
}

export function humanizeResourceTitleFromFilename(filename: string): string {
  const base = basenameFromFileUrl(filename);
  const inferred = inferCaieFromBasename(base);
  if (inferred.sessionLabel && inferred.docKind !== "other") {
    const paper = inferred.variant != null ? paperLabelFromVariant(inferred.variant, inferred.docKind) : "";
    const kind = docKindLabel(inferred.docKind);
    if (inferred.docKind === "er") return `${inferred.sessionLabel} — ${kind}`;
    if (inferred.docKind === "ecr") return `${inferred.sessionLabel} — examiner candidate responses`;
    return `${inferred.sessionLabel} — ${kind}${paper ? ` — ${paper}` : ""}`;
  }
  const stem = base.replace(/\.[a-z0-9]+$/i, "");
  const words = stem
    .replace(/[_-]+/g, " ")
    .replace(/\(\s*\d+\s*\)/g, "")
    .trim();
  return words.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || stem;
}

export function slugifyFileStem(stem: string): string {
  return stem
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Heuristic metadata for ingested PDFs (Drive exports, topical packs, etc.). */
export function inferResourceFieldsFromFilename(
  filename: string,
  hubCategory: ResourceHubCategory
): Pick<Resource, "title" | "year" | "paper" | "description"> {
  const base = basenameFromFileUrl(filename);
  const inferred = inferCaieFromBasename(base);
  if (inferred.sessionLabel && inferred.docKind !== "other") {
    const paper =
      inferred.variant != null
        ? paperLabelFromVariant(inferred.variant, inferred.docKind)
        : inferred.docKind === "er" || inferred.docKind === "ecr"
          ? "All papers"
          : "See document";
    const title = humanizeResourceTitleFromFilename(base);
    return {
      title,
      year: inferred.sessionLabel,
      paper,
      description: "Official Cambridge assessment material for timed practice and self-marking.",
    };
  }

  const title = humanizeResourceTitleFromFilename(base);
  const paper =
    hubCategory === "general-notes"
      ? "All papers"
      : /paper\s*1|p1|directed/i.test(base)
        ? "Paper 1"
        : /paper\s*2|p2|comprehension|summary/i.test(base)
          ? "Paper 2"
          : "Paper 2";
  const year = hubCategory === "yearly-past-papers" || hubCategory === "examiner-reports" ? "Mixed" : "Practice";
  const description =
    hubCategory === "general-notes"
      ? "Summary and notes pack aligned to O Level English 1123."
      : hubCategory === "topical-worksheets"
        ? "Targeted practice for common 1123 question types."
        : hubCategory === "examiner-reports"
          ? "Examiner-facing guidance and illustrative responses."
          : "Checklist or practice sheet for exam-week revision.";
  return { title, year, paper, description };
}
