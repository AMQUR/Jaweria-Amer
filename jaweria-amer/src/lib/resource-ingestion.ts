import type { Resource, ResourceHubCategory, ResourceNotesSubCategory } from "./data";

/** Scored session script: `S25 (Paper 2) 46/50` — display-only, Scripts category. */
function tryFormatExaminerReportsSessionScoreTitle(raw: string): string | null {
  let s = raw.replace(/\s+/g, " ").trim();
  s = s.replace(/^([SW]\d{2})-\s+/i, "$1 ");
  const patterns: RegExp[] = [
    /^([SW]\d{2})\s+Paper\s+([12])\s+\(\s*(\d+)\s+(\d+)\s*\)$/i,
    /^([SW]\d{2})\s+Paper\s+([12])\s+\(\s*(\d+)\s*\/\s*(\d+)\s*\)$/i,
    /^([SW]\d{2})\s+Paper\s+([12])\s+\(\s*(\d+)\s*_\s*(\d+)\s*\)$/i,
    /^([SW]\d{2})\s+Paper\s+([12])\s+(\d+)\s+(\d+)$/i,
    /^([SW]\d{2})\s+Paper\s+([12])\s+(\d+)\s*\/\s*(\d+)$/i,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const session = m[1]!.toUpperCase();
      const paper = m[2]!;
      const num = m[3]!;
      const den = m[4]!;
      return `${session} (Paper ${paper}) ${num}/${den}`;
    }
  }
  return null;
}

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
  worksheets: "topicals",
  "past-papers": "yearly-past-papers",
  "examiner-reports": "examiner-reports",
  checklists: "checklists",
};

export function hubCategoryForDiskFolder(folder: string): ResourceHubCategory {
  return RESOURCE_FOLDER_TO_CATEGORY[folder] ?? "topicals";
}

export function basenameFromFileUrl(fileUrl: string): string {
  const clean = fileUrl.split("?")[0] ?? fileUrl;
  const parts = clean.split("/");
  return parts[parts.length - 1] ?? clean;
}

/** Strip repeated Google-Drive-style "Copy of " prefixes from the start of a title only. */
export function cleanCopyOfTitlePrefix(title: string): string {
  let t = title.trim();
  const prefix = /^copy\s+of\s+/i;
  while (prefix.test(t)) {
    t = t.replace(prefix, "").trim();
  }
  return t;
}

/**
 * Human-readable label for vault UI only. Does not change stored `Resource.title`.
 * Runs after {@link cleanCopyOfTitlePrefix} (applied internally).
 * Pass `category` so Scripts (`examiner-reports`) scored papers can use `SESSION (Paper N) score/max`.
 */
export function formatDisplayTitle(title: string, category?: ResourceHubCategory): string {
  const t = cleanCopyOfTitlePrefix(title).replace(/\s+/g, " ").trim();
  if (!t) return t;

  if (category === "examiner-reports") {
    const sessionScore = tryFormatExaminerReportsSessionScoreTitle(t);
    if (sessionScore) return sessionScore;
  }

  // "11 1123 FOA2 P1 ScriptB" → "Paper 1 Script B (1123)"
  let m = t.match(/^(\d+)\s+1123\s+FOA2\s+P(\d)\s+Script\s*([A-Za-z])\s*$/i);
  if (m) {
    return `Paper ${m[2]} Script ${m[3]!.toUpperCase()} (1123)`;
  }

  // "1123 FOA2 P1 ScriptB" (no leading index)
  m = t.match(/^1123\s+FOA2\s+P(\d)\s+Script\s*([A-Za-z])\s*$/i);
  if (m) {
    return `Paper ${m[1]} Script ${m[2]!.toUpperCase()} (1123)`;
  }

  // "1123 SpecimenAnswers P2" / "1123 Specimen Answers P2" → "Specimen Answers Paper 2 (1123)"
  m = t.match(/^1123\s+(?:SpecimenAnswers|Specimen\s+Answers)\s+P(\d)\s*$/i);
  if (m) {
    return `Specimen Answers Paper ${m[1]} (1123)`;
  }

  // "NN 1123 FOA2 …" (advice, marking guidance, formative feedback, etc.)
  m = t.match(/^\d+\s+1123\s+FOA2\s+(.+)$/i);
  if (m) {
    const rest = m[1]!.replace(/\bFOA2\b/gi, "").replace(/\s+/g, " ").trim();
    if (rest.length > 0) return `${rest} (1123)`;
  }

  // Drop stray syllabus-framework tokens; collapse spaces
  return t.replace(/\bFOA2\b/gi, "").replace(/\s+/g, " ").trim() || t;
}

/** Vault chip for Scripts (`examiner-reports`) cards — display only. */
export type ScriptsVaultChip = "SCRIPT" | "SPECIMEN" | "GUIDANCE";

/**
 * Classify a Scripts resource for the small label chip (SCRIPT / SPECIMEN / GUIDANCE).
 * Uses raw + formatted title heuristics.
 */
export function scriptsResourceVaultChip(rawTitle: string, displayTitle: string): ScriptsVaultChip {
  const r = rawTitle.toLowerCase();
  const d = displayTitle.toLowerCase();

  if (/^[sw]\d{2}\s+\(paper\s+[12]\)\s+\d+\/\d+$/i.test(displayTitle.trim())) {
    return "SCRIPT";
  }

  if (d.includes("specimen answers") || /specimen\s+answers/i.test(displayTitle)) {
    return "SPECIMEN";
  }

  if (/paper\s+\d+\s+script\s+[a-z]/i.test(displayTitle)) {
    return "SCRIPT";
  }
  if (/candidate response|examiner candidate response/i.test(r) || /examiner candidate/i.test(d)) {
    return "SCRIPT";
  }
  if (
    /paper\s*\d+\s*\(|s\d+[- ]*paper|narrative essay|letter writing|answer script/i.test(r) ||
    /paper\s*\d+\s*\(/i.test(displayTitle)
  ) {
    return "SCRIPT";
  }

  if (
    /principal examiner|examiner report\b|marking guidance|\badvice\b|formative feedback|using past papers/i.test(
      r
    ) ||
    /principal examiner|examiner report\b|marking guidance|\badvice\b|formative feedback|using past papers/i.test(d)
  ) {
    return "GUIDANCE";
  }

  if (r.includes("specimen") && !r.includes("ecr")) {
    return "SPECIMEN";
  }

  return "GUIDANCE";
}

/**
 * Split {@link formatDisplayTitle} output into a primary heading and optional secondary line
 * (syllabus code, session snippet, or score line in parentheses).
 */
export function splitScriptsCardTitle(display: string): { main: string; secondary: string | null } {
  const d = display.trim();
  const m1123 = d.match(/^(.+?)\s+\((1123)\)\s*$/);
  if (m1123) {
    return { main: m1123[1]!.trim(), secondary: "1123" };
  }
  const m = d.match(/^(.+?)\s+\(([^)]+)\)\s*$/);
  if (m) {
    const inner = m[2]!.trim();
    if (
      inner === "1123" ||
      /^(nov|may\/june)\s/i.test(inner) ||
      /^specimen$/i.test(inner) ||
      /^\d{4}$/.test(inner) ||
      /\d+\s*out\s*of\s*\d+/i.test(inner) ||
      /^qp\s*\d+/i.test(inner) ||
      /^\d+_\d+/.test(inner)
    ) {
      return { main: m[1]!.trim(), secondary: inner };
    }
  }
  return { main: d, secondary: null };
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

  if (
    haystack.includes("essay") ||
    haystack.includes("descriptive") ||
    haystack.includes("narrative") ||
    haystack.includes("vocabulary for essay") ||
    haystack.includes("sample essay")
  ) {
    return "essay-writing";
  }
  if (haystack.includes("directed writing")) return "directed-writing";
  if (haystack.includes("pde") || haystack.includes("short response") || haystack.includes("formats")) {
    return "directed-writing";
  }
  if (haystack.includes("comprehension")) return "comprehension";
  if (haystack.includes("summary")) return "summary-writing";
  if (resource.fileUrl.toLowerCase().includes("/notes/solved-papers/")) return "solved-papers";
  if (
    haystack.includes("grammar") ||
    haystack.includes("sentence") ||
    haystack.includes("punctuation") ||
    haystack.includes("grammatical errors")
  ) {
    return "grammar";
  }
  return undefined;
}

type TopicalsStrictSection = "Comprehension" | "Summary" | "Essay" | "Directed Writing";

/** Topicals: only P1 (Comprehension, Summary) and P2 (Essay, Directed Writing); paper follows section. */
export function normalizeTopicalsResource(resource: Resource): Resource {
  if (resource.category !== "topicals") return resource;

  const raw = `${resource.title || ""} ${basenameFromFileUrl(resource.fileUrl) || ""}`
    .toLowerCase()
    .replace(/[-_]+/g, " ");

  const section: TopicalsStrictSection = inferStrictTopicalsSection(resource, raw);

  if (section === "Comprehension" || section === "Summary") {
    return { ...resource, paper: "Paper 1", section };
  }
  return { ...resource, paper: "Paper 2", section };
}

function inferStrictTopicalsSection(resource: Resource, raw: string): TopicalsStrictSection {
  const s = resource.section?.trim();
  if (s === "Comprehension" || s === "Summary" || s === "Essay" || s === "Directed Writing") {
    return s;
  }
  if (s === "Essay Writing" || s === "Composition") return "Essay";
  if (s === "Summary Writing") return "Summary";
  if (s === "Language" || s === "General Reading" || s === "Grammar" || s === "Vocabulary") {
    return "Comprehension";
  }
  if (s === "General Writing") {
    return raw.includes("summary") && !raw.includes("comprehension") ? "Summary" : "Directed Writing";
  }

  if (raw.includes("summary") && !raw.includes("comprehension")) return "Summary";
  if (
    raw.includes("comprehension") ||
    /\bpc\d?\b/.test(raw) ||
    /\bpc \d+/.test(raw) ||
    /practice comp/.test(raw) ||
    raw.includes("writer") ||
    raw.includes("use of language") ||
    raw.includes("exam hack") ||
    raw.includes("question 1") ||
    raw.includes("question 2") ||
    raw.includes("question 3") ||
    /\bq[123]\b/.test(raw) ||
    raw.includes("vocab")
  ) {
    return "Comprehension";
  }
  if (
    raw.includes("directed writing") ||
    (raw.includes("directed") && raw.includes("topics")) ||
    raw.includes("article topics") ||
    raw.includes("email topics") ||
    raw.includes("letter topics") ||
    raw.includes("report topics") ||
    raw.includes("speech topics") ||
    raw.includes("interviewer") ||
    raw.includes("phrases to") ||
    raw.includes("sentences you can")
  ) {
    return "Directed Writing";
  }
  if (
    raw.includes("essay") ||
    raw.includes("composition") ||
    raw.includes("descriptive") ||
    raw.includes("narrative")
  ) {
    return "Essay";
  }
  if (raw.includes("paper 2") || raw.includes("p2")) return "Comprehension";
  if (raw.includes("paper 1") || raw.includes("p1")) {
    return raw.includes("summary") ? "Summary" : "Comprehension";
  }
  return "Comprehension";
}

function normalizeGuidedPaper(resource: Pick<Resource, "paper" | "title" | "fileUrl" | "category">): string {
  if (resource.category === "topicals" || resource.category === "vocabulary") {
    return resource.paper;
  }

  const contentHaystack = `${resource.title} ${basenameFromFileUrl(resource.fileUrl)}`
    .toLowerCase()
    .replace(/[-_]+/g, " ");
  const paperHaystack = resource.paper.toLowerCase();

  if (
    contentHaystack.includes("summary") ||
    contentHaystack.includes("comprehension") ||
    contentHaystack.includes("writer") ||
    contentHaystack.includes("use of language")
  ) {
    return "Paper 2";
  }

  if (
    contentHaystack.includes("directed") ||
    contentHaystack.includes("essay") ||
    contentHaystack.includes("descriptive") ||
    contentHaystack.includes("narrative") ||
    contentHaystack.includes("interviewer") ||
    contentHaystack.includes("vocab") ||
    contentHaystack.includes("phrases") ||
    contentHaystack.includes("sentences") ||
    contentHaystack.includes("pde") ||
    contentHaystack.includes("short response")
  ) {
    return "Paper 1";
  }

  if (
    paperHaystack.includes("paper 1") ||
    /\bp1\b/.test(paperHaystack)
  ) {
    return "Paper 1";
  }

  if (paperHaystack.includes("paper 2") || /\bp2\b/.test(paperHaystack)) {
    return "Paper 2";
  }

  return resource.paper;
}

function isMarkSchemeResource(resource: Pick<Resource, "title" | "fileUrl" | "category" | "subCategory">): boolean {
  const fileUrlLower = resource.fileUrl.toLowerCase();
  /** Solved worked papers live under Notes; "solved" in the stem must not force the MS → checklists path. */
  if (fileUrlLower.includes("/notes/solved-papers/")) return false;
  /** Notes vocabulary banks are not mark schemes. */
  if (fileUrlLower.includes("/notes/vocabulary/")) return false;
  /** Vocabulary subCategory resources are never mark schemes. */
  if (resource.subCategory?.includes("vocabulary")) return false;

  const haystack = `${resource.title} ${basenameFromFileUrl(resource.fileUrl)}`
    .toLowerCase()
    .replace(/[-_]+/g, " ");
  const inferred = inferCaieFromBasename(basenameFromFileUrl(resource.fileUrl));

  return (
    inferred.docKind === "ms" ||
    haystack.includes("marking scheme") ||
    /\bms\b/.test(haystack) ||
    haystack.includes(" solved") ||
    haystack.includes("solution")
  );
}

function inferResourceSection(
  resource: Pick<Resource, "title" | "fileUrl" | "category" | "subCategory" | "year">
): string | undefined {
  const haystack = `${resource.title} ${basenameFromFileUrl(resource.fileUrl)}`
    .toLowerCase()
    .replace(/[-_]+/g, " ");

  if (resource.category === "general-notes") {
    const subCategory = resource.subCategory ?? inferGeneralNotesSubCategory(resource);
    if (subCategory === "summary-writing") return "Summary Writing";
    if (subCategory === "comprehension") return "Comprehension";
    if (subCategory === "essay-writing") return "Essay Writing";
    if (subCategory === "directed-writing") return "Directed Writing";
    if (subCategory === "grammar") return "Grammar";
    if (subCategory === "solved-papers") return "Solved Papers";
    return undefined;
  }

  if (resource.category === "topicals" || resource.category === "checklists") {
    if (rawLooksLikeTopicalsQuestion(resource)) {
      if (haystack.includes("q1") || haystack.includes("question 1") || /\b11\b/.test(haystack)) {
        return "Question 1";
      }
      if (haystack.includes("q2") || haystack.includes("question 2") || /\b12\b/.test(haystack)) {
        return "Question 2";
      }
      if (haystack.includes("q3") || haystack.includes("question 3") || /\b13\b/.test(haystack)) {
        return "Question 3";
      }
      return "General";
    }
    if (haystack.includes("summary")) {
      return resource.category === "topicals" ? "Summary" : "Summary Writing";
    }
    if (
      haystack.includes("comprehension") ||
      haystack.includes("use of language") ||
      haystack.includes("writer")
    ) {
      return "Comprehension";
    }
    if (
      haystack.includes("vocab") ||
      haystack.includes("vocabulary") ||
      haystack.includes("writing words")
    ) {
      return "Vocabulary";
    }
    if (
      haystack.includes("essay") ||
      haystack.includes("descriptive") ||
      haystack.includes("narrative")
    ) {
      return "Essay Writing";
    }
    if (
      haystack.includes("directed") ||
      haystack.includes("interviewer") ||
      haystack.includes("phrases") ||
      haystack.includes("sentences") ||
      haystack.includes("pde") ||
      haystack.includes("short response")
    ) {
      return "Directed Writing";
    }
    if (
      haystack.includes("grammar") ||
      haystack.includes("sentence") ||
      haystack.includes("punctuation") ||
      haystack.includes("grammatical errors")
    ) {
      return "Grammar";
    }
  }

  if (resource.category === "yearly-past-papers" || resource.category === "checklists") {
    if (/specimen/i.test(resource.title) || /specimen/i.test(resource.fileUrl)) return "Specimen";
    if (resource.year && resource.year !== "Mixed" && resource.year !== "Practice" && resource.year !== "Current") {
      return resource.year;
    }
  }

  return undefined;
}

function rawLooksLikeTopicalsQuestion(resource: Pick<Resource, "category" | "title" | "fileUrl">) {
  if (resource.category !== "topicals") return false;
  const raw = `${resource.title} ${basenameFromFileUrl(resource.fileUrl)}`.toLowerCase();
  return (
    raw.includes("question") ||
    /\bq[123]\b/.test(raw) ||
    /\b1[123]\b/.test(raw) ||
    raw.includes("qp11") ||
    raw.includes("qp12")
  );
}

function shouldHideResource(resource: Pick<Resource, "title" | "fileUrl" | "category" | "subCategory" | "type">) {
  const haystack = `${resource.title} ${basenameFromFileUrl(resource.fileUrl)}`
    .toLowerCase()
    .replace(/[-_]+/g, " ");

  if (resource.type === "mcq") return false;
  if (resource.category === "general-notes" && (resource.subCategory ?? inferGeneralNotesSubCategory(resource)) == null) {
    return true;
  }
  return haystack.includes("syllabus") || haystack.includes("specification") || haystack.includes("changes in the syllabus");
}

/**
 * Drops later duplicates (same normalized basename or very similar title + same session tuple).
 * Preserves first occurrence order.
 */
export function finalizeResourcesForSite(items: readonly Resource[]): Resource[] {
  const normalized = items
    .map((item) => {
      const legacyChecklist = item.category === "checklists";
      const cleanTitle = cleanCopyOfTitlePrefix(item.title);
      const subCategory =
        item.category === "general-notes" ? item.subCategory ?? inferGeneralNotesSubCategory(item) : item.subCategory;
      const category =
        !legacyChecklist && isMarkSchemeResource(item) && item.category !== "topicals" ? "checklists" : item.category;
      const baseItem: Resource = {
        ...item,
        title: cleanTitle,
        category,
        paper: normalizeGuidedPaper(item),
        subCategory,
        section: item.section ?? inferResourceSection({ ...item, category, subCategory }),
      };
      const normalizedItem = normalizeTopicalsResource(baseItem);
      return {
        item: normalizedItem,
        copyKey: `${category}|${normalizeFilenameKey(cleanTitle)}`,
        legacyChecklist,
        wasCopy: /^copy\s+of\s+/i.test(item.title.trim()),
      };
    })
    .filter(({ item, legacyChecklist }) => !legacyChecklist && !shouldHideResource(item));

  const preferredNonCopyKeys = new Set(
    normalized.filter(({ wasCopy }) => !wasCopy).map(({ copyKey }) => copyKey)
  );

  const out: Resource[] = [];
  const seenBasenames = new Set<string>();
  const seenIds = new Set<string>();
  const seenTitleKeys = new Set<string>();

  for (const entry of normalized) {
    const item = entry.item;
    if (entry.wasCopy && preferredNonCopyKeys.has(entry.copyKey)) {
      logDuplicateSkipped(item.title, "copy-of duplicate");
      continue;
    }
    if (seenIds.has(item.id)) {
      logDuplicateSkipped(`id:${item.id}`, "duplicate id");
      continue;
    }
    const bn = normalizeFilenameKey(basenameFromFileUrl(item.fileUrl));
    if (bn.length > 0 && seenBasenames.has(bn)) {
      logDuplicateSkipped(basenameFromFileUrl(item.fileUrl), "normalized filename");
      continue;
    }
    const titleKey = `${item.category}|${normalizeFilenameKey(item.title)}|${item.paper}|${item.section ?? ""}`;
    if (titleKey.length > 0 && seenTitleKeys.has(titleKey)) {
      logDuplicateSkipped(item.title, "normalized title");
      continue;
    }

    seenIds.add(item.id);
    if (bn.length > 0) seenBasenames.add(bn);
    if (titleKey.length > 0) seenTitleKeys.add(titleKey);
    out.push(item);
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
  let raw: string;
  if (inferred.sessionLabel && inferred.docKind !== "other") {
    const paper = inferred.variant != null ? paperLabelFromVariant(inferred.variant, inferred.docKind) : "";
    const kind = docKindLabel(inferred.docKind);
    if (inferred.docKind === "er") raw = `${inferred.sessionLabel} — ${kind}`;
    else if (inferred.docKind === "ecr") raw = `${inferred.sessionLabel} — examiner candidate responses`;
    else raw = `${inferred.sessionLabel} — ${kind}${paper ? ` — ${paper}` : ""}`;
  } else {
    const stem = base.replace(/\.[a-z0-9]+$/i, "");
    const words = stem
      .replace(/[_-]+/g, " ")
      .replace(/\(\s*\d+\s*\)/g, "")
      .trim();
    raw = words.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || stem;
  }
  return cleanCopyOfTitlePrefix(raw);
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
      : hubCategory === "topicals"
        ? "Targeted practice for common 1123 question types."
        : hubCategory === "examiner-reports"
          ? "Examiner-facing guidance and illustrative responses."
          : "Checklist or practice sheet for exam-week revision.";
  return { title, year, paper, description };
}
