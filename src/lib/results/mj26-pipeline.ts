/**
 * M/J 2026 public-results pipeline — pure, deterministic, unit-tested.
 *
 * Source of truth: the "English With Miss Jay M/J 26 Results (Responses)"
 * Google Form export (CSV). The raw export is PII and is never committed
 * (it lives only in the git-ignored `scripts/source/`); only the public-safe
 * dataset produced here (`src/lib/results/mj-2026.public.json`) is.
 *
 * This is the same logic that produced the verified English With Miss Jay
 * results showcase (source fingerprint 8221580849f05068), ported so both
 * sites recompute identical figures from the identical export.
 *
 * Principles (docs/results/MJ26_RESULTS_METHODOLOGY.md):
 *  - Least-privilege publication. A record is public only when the form answer
 *    supports it; any conflict or blank answer is a HOLD (kept private).
 *  - "No grade" is never a grade. "Other"/blank grades are excluded from every
 *    grade statistic and counted separately.
 *  - Denominators are explicit: raw responses ≠ unique records ≠ graded
 *    records ≠ publicly shareable records.
 */

export type GradeLabel = "A*" | "A" | "B" | "C" | "D" | "E" | "U";
export const GRADE_ORDER: GradeLabel[] = ["A*", "A", "B", "C", "D", "E", "U"];

export type SyllabusCode = "1123" | "0500" | "0510" | "9093";

export type ShareAnswer = "named" | "anonymous" | "private" | "missing";
export type PhotoAnswer = "yes" | "result_only" | "private_all" | "missing";

export type PublicLevel = "named" | "anonymous";

export interface RawResponse {
  /** 0-based index of the data row in the export (header excluded). */
  rowIndex: number;
  timestamp: string;
  email: string;
  fullName: string;
  whatsapp: string;
  qualification: string;
  studiedWhere: string;
  grade: string;
  screenshotUrl: string;
  shareAnswer: string;
  photoAnswer: string;
  photoUrl: string;
  messageToMissJay: string;
  videoTestimonial: string;
  anythingElse: string;
}

export interface NormalizedRecord {
  rowIndex: number;
  timestampMs: number;
  emailKey: string;
  nameKey: string;
  displayName: string;
  grade: GradeLabel | null;
  gradeRaw: string;
  syllabus: SyllabusCode | null;
  share: ShareAnswer;
  photo: PhotoAnswer;
  photoFileId: string | null;
  screenshotFileId: string | null;
  incomplete: boolean;
}

export type HoldReason =
  | "incomplete_row"
  | "exact_duplicate_superseded"
  | "ambiguous_duplicate"
  | "grade_unclassified"
  | "syllabus_unknown"
  | "consent_private"
  | "consent_missing"
  | "consent_conflict_private_photo_answer"
  | "photo_without_name_consent"
  | "photo_consent_without_file";

export interface Hold {
  rowIndex: number;
  reason: HoldReason;
  note?: string;
}

export interface PublicResultRecord {
  /** Stable archive id, e.g. "MJ26-042". */
  id: string;
  seq: number;
  grade: GradeLabel;
  syllabus: SyllabusCode;
  level: PublicLevel;
  /** Present only when level === "named". */
  name: string | null;
  /** True when a portrait was consented AND supplied; asset resolved separately. */
  hasPhoto: boolean;
}

export interface GradeCounts {
  total: number;
  byGrade: Record<GradeLabel, number>;
  aStar: number;
  a: number;
  aOrAStar: number;
  /** Percentage (one decimal) of aOrAStar over total; null when total is 0. */
  aOrAStarPct: number | null;
  aStarPct: number | null;
}

export interface Mj26Summary {
  session: "May/June 2026";
  board: "Cambridge";
  rawResponses: number;
  incompleteRows: number;
  exactDuplicatesRemoved: number;
  ambiguousDuplicates: number;
  uniqueRecords: number;
  uniqueStudents: number;
  multiSyllabusStudents: number;
  gradeUnclassified: number;
  syllabusUnknown: number;
  /** All unique records with a classifiable grade (internal reference). */
  graded: GradeCounts;
  /** Records the student agreed we may share (named or anonymised). */
  shareable: GradeCounts & {
    named: number;
    anonymous: number;
    withPhoto: number;
    bySyllabus: Record<SyllabusCode, GradeCounts>;
  };
  privateRecords: number;
  holdsByReason: Record<HoldReason, number>;
}

export interface Mj26Dataset {
  version: 1;
  session: "May/June 2026";
  generatedAt: string;
  sourceFingerprint: string;
  summary: Mj26Summary;
  records: PublicResultRecord[];
}

/* ───────────────────────── normalisation ───────────────────────── */

const HEADER = {
  timestamp: "Timestamp",
  email: "Email Address",
  fullName: "Full name",
  whatsapp: "WhatsApp number",
  qualification: "Which qualification did you take with us?",
  studiedWhere: "Where did you study with us?",
  grade: "Your grade in English",
  screenshotUrl: "Screenshot of your result",
  shareAnswer: "Can we share your result on Instagram, our website and WhatsApp?",
  photoAnswer: "Are you comfortable with us posting a photo of you alongside it?",
  photoUrl: "Your photo",
  messageToMissJay: "Anything you want to say to Miss Jay?",
  videoTestimonial: "Would you record a short video testimonial for us?",
  anythingElse: "Anything else you want us to know?",
} as const;

export function rowsToRawResponses(rows: Array<Record<string, string>>): RawResponse[] {
  return rows.map((r, i) => ({
    rowIndex: i,
    timestamp: r[HEADER.timestamp] ?? "",
    email: r[HEADER.email] ?? "",
    fullName: r[HEADER.fullName] ?? "",
    whatsapp: r[HEADER.whatsapp] ?? "",
    qualification: r[HEADER.qualification] ?? "",
    studiedWhere: r[HEADER.studiedWhere] ?? "",
    grade: r[HEADER.grade] ?? "",
    screenshotUrl: r[HEADER.screenshotUrl] ?? "",
    shareAnswer: r[HEADER.shareAnswer] ?? "",
    photoAnswer: r[HEADER.photoAnswer] ?? "",
    photoUrl: r[HEADER.photoUrl] ?? "",
    messageToMissJay: r[HEADER.messageToMissJay] ?? "",
    videoTestimonial: r[HEADER.videoTestimonial] ?? "",
    anythingElse: r[HEADER.anythingElse] ?? "",
  }));
}

export function normalizeGrade(raw: string): GradeLabel | null {
  const g = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (g === "A*" || g === "A＊" || g === "ASTAR" || g === "A-STAR") return "A*";
  if (g === "A") return "A";
  if (g === "B") return "B";
  if (g === "C") return "C";
  if (g === "D") return "D";
  if (g === "E") return "E";
  if (g === "U") return "U";
  return null; // "Other", blank, or anything we cannot classify
}

export function normalizeSyllabus(raw: string): SyllabusCode | null {
  const q = raw.toLowerCase();
  if (q.includes("1123")) return "1123";
  if (q.includes("0500")) return "0500";
  if (q.includes("0510") || q.includes("0511")) return "0510";
  if (q.includes("9093")) return "9093";
  return null;
}

export function normalizeShare(raw: string): ShareAnswer {
  const s = raw.toLowerCase();
  if (!s.trim()) return "missing";
  if (s.startsWith("yes") && s.includes("hide")) return "anonymous";
  if (s.startsWith("yes")) return "named";
  if (s.startsWith("no")) return "private";
  return "missing";
}

export function normalizePhoto(raw: string): PhotoAnswer {
  const s = raw.toLowerCase();
  if (!s.trim()) return "missing";
  if (s.startsWith("yes")) return "yes";
  if (s.includes("keep everything private")) return "private_all";
  if (s.startsWith("no")) return "result_only";
  return "missing";
}

export function driveFileId(url: string): string | null {
  const m = url.match(/[?&]id=([A-Za-z0-9_-]{10,})/) ?? url.match(/\/d\/([A-Za-z0-9_-]{10,})/);
  return m ? m[1] : null;
}

/** Google Forms timestamps look like "8/18/2026 10:09:34" (form owner's zone). */
export function parseFormTimestamp(raw: string): number {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return Number.NaN;
  const [, mo, d, y, h = "0", mi = "0", s = "0"] = m;
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
}

export function nameKey(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function displayNameFrom(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  // Title-case shouting or all-lowercase entries; keep already-mixed-case names as typed.
  const isShout = cleaned === cleaned.toUpperCase() || cleaned === cleaned.toLowerCase();
  if (!isShout) return cleaned;
  return cleaned
    .split(" ")
    .map((w) => (w.length <= 2 && w.endsWith(".") ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

export function normalizeResponse(r: RawResponse): NormalizedRecord {
  const emailKey = r.email.trim().toLowerCase();
  const nk = nameKey(r.fullName);
  const grade = normalizeGrade(r.grade);
  const incomplete = !emailKey && !nk && grade === null;
  return {
    rowIndex: r.rowIndex,
    timestampMs: parseFormTimestamp(r.timestamp),
    emailKey,
    nameKey: nk,
    displayName: displayNameFrom(r.fullName),
    grade,
    gradeRaw: r.grade,
    syllabus: normalizeSyllabus(r.qualification),
    share: normalizeShare(r.shareAnswer),
    photo: normalizePhoto(r.photoAnswer),
    photoFileId: driveFileId(r.photoUrl),
    screenshotFileId: driveFileId(r.screenshotUrl),
    incomplete,
  };
}

/* ───────────────────────── de-duplication ───────────────────────── */

export interface DedupResult {
  kept: NormalizedRecord[];
  holds: Hold[];
  exactDuplicatesRemoved: number;
  ambiguousDuplicates: number;
}

/**
 * Dedup key = normalised e-mail (the form collected sign-in e-mail, so the
 * same student re-submitting produces the same key). Within a key group:
 *  - same name + same grade + same syllabus → exact duplicate: keep the LATEST
 *    submission (its consent answers supersede earlier ones).
 *  - same name but different grade/syllabus → ambiguous: hold ALL rows of the
 *    group out of the public dataset and out of statistics.
 *  - different names on one e-mail (siblings sharing an address) → distinct
 *    records; not deduped.
 * Two different e-mails with the same name are two people (we never merge on
 * name alone) — they are flagged for the owner but kept.
 */
export function dedupeRecords(records: NormalizedRecord[]): DedupResult {
  const holds: Hold[] = [];
  const kept: NormalizedRecord[] = [];
  let exactDuplicatesRemoved = 0;
  let ambiguousDuplicates = 0;

  const usable = records.filter((r) => {
    if (r.incomplete) {
      holds.push({ rowIndex: r.rowIndex, reason: "incomplete_row" });
      return false;
    }
    return true;
  });

  const groups = new Map<string, NormalizedRecord[]>();
  for (const r of usable) {
    const key = r.emailKey ? `email:${r.emailKey}|name:${r.nameKey}` : `row:${r.rowIndex}`;
    const g = groups.get(key) ?? [];
    g.push(r);
    groups.set(key, g);
  }

  for (const g of groups.values()) {
    if (g.length === 1) {
      kept.push(g[0]);
      continue;
    }
    const signature = (r: NormalizedRecord) => `${r.grade ?? "?"}|${r.syllabus ?? "?"}`;
    const sigs = new Set(g.map(signature));
    if (sigs.size === 1) {
      const sorted = [...g].sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0) || a.rowIndex - b.rowIndex);
      const latest = sorted[sorted.length - 1];
      for (const r of sorted.slice(0, -1)) {
        holds.push({ rowIndex: r.rowIndex, reason: "exact_duplicate_superseded", note: `superseded by row ${latest.rowIndex}` });
        exactDuplicatesRemoved++;
      }
      kept.push(latest);
    } else {
      for (const r of g) {
        holds.push({ rowIndex: r.rowIndex, reason: "ambiguous_duplicate", note: `conflicting grade/syllabus within one e-mail+name group` });
        ambiguousDuplicates++;
      }
    }
  }

  kept.sort((a, b) => (a.timestampMs || 0) - (b.timestampMs || 0) || a.rowIndex - b.rowIndex);
  return { kept, holds, exactDuplicatesRemoved, ambiguousDuplicates };
}

/* ───────────────────────── consent ───────────────────────── */

export interface ConsentDecision {
  level: PublicLevel | null;
  photoAllowed: boolean;
  holds: Hold[];
}

export function decideConsent(r: NormalizedRecord): ConsentDecision {
  const holds: Hold[] = [];
  if (r.share === "private") {
    holds.push({ rowIndex: r.rowIndex, reason: "consent_private" });
    return { level: null, photoAllowed: false, holds };
  }
  if (r.share === "missing") {
    holds.push({ rowIndex: r.rowIndex, reason: "consent_missing" });
    return { level: null, photoAllowed: false, holds };
  }
  if (r.photo === "private_all") {
    // "No photo and no result, keep everything private" contradicts a Yes on
    // sharing. Ambiguity resolves to private.
    holds.push({ rowIndex: r.rowIndex, reason: "consent_conflict_private_photo_answer" });
    return { level: null, photoAllowed: false, holds };
  }
  const level: PublicLevel = r.share === "named" ? "named" : "anonymous";
  let photoAllowed = false;
  if (r.photo === "yes") {
    if (level !== "named") {
      holds.push({ rowIndex: r.rowIndex, reason: "photo_without_name_consent", note: "photo consented but name hidden — photo not used" });
    } else if (!r.photoFileId) {
      holds.push({ rowIndex: r.rowIndex, reason: "photo_consent_without_file" });
    } else {
      photoAllowed = true;
    }
  }
  return { level, photoAllowed, holds };
}

/* ───────────────────────── statistics ───────────────────────── */

export function emptyGradeCounts(): GradeCounts {
  const byGrade = Object.fromEntries(GRADE_ORDER.map((g) => [g, 0])) as Record<GradeLabel, number>;
  return { total: 0, byGrade, aStar: 0, a: 0, aOrAStar: 0, aOrAStarPct: null, aStarPct: null };
}

export function gradeCounts(grades: GradeLabel[]): GradeCounts {
  const c = emptyGradeCounts();
  for (const g of grades) {
    c.byGrade[g] += 1;
    c.total += 1;
  }
  c.aStar = c.byGrade["A*"];
  c.a = c.byGrade["A"];
  c.aOrAStar = c.aStar + c.a;
  c.aOrAStarPct = c.total ? Math.round((c.aOrAStar / c.total) * 1000) / 10 : null;
  c.aStarPct = c.total ? Math.round((c.aStar / c.total) * 1000) / 10 : null;
  return c;
}

/* ───────────────────────── build ───────────────────────── */

export interface BuildOutput {
  dataset: Mj26Dataset;
  holds: Hold[];
  /** Private manifest for the photo sync step: archive id → Drive file id. */
  photoManifest: Array<{ id: string; driveFileId: string; rowIndex: number }>;
}

export function buildMj26Dataset(
  rows: Array<Record<string, string>>,
  opts: { generatedAt: string; sourceFingerprint: string },
): BuildOutput {
  const raw = rowsToRawResponses(rows);
  const normalized = raw.map(normalizeResponse);
  const dedup = dedupeRecords(normalized);
  const holds: Hold[] = [...dedup.holds];

  const holdsByReason = Object.fromEntries(
    [
      "incomplete_row",
      "exact_duplicate_superseded",
      "ambiguous_duplicate",
      "grade_unclassified",
      "syllabus_unknown",
      "consent_private",
      "consent_missing",
      "consent_conflict_private_photo_answer",
      "photo_without_name_consent",
      "photo_consent_without_file",
    ].map((k) => [k, 0]),
  ) as Record<HoldReason, number>;

  const gradedAll: GradeLabel[] = [];
  const shareableGrades: GradeLabel[] = [];
  const bySyllabus: Record<SyllabusCode, GradeLabel[]> = { "1123": [], "0500": [], "0510": [], "9093": [] };
  const publicRecords: PublicResultRecord[] = [];
  const photoManifest: BuildOutput["photoManifest"] = [];
  let gradeUnclassified = 0;
  let syllabusUnknown = 0;
  let privateRecords = 0;
  let named = 0;
  let anonymous = 0;
  let withPhoto = 0;
  let seq = 0;

  for (const r of dedup.kept) {
    if (r.grade === null) {
      gradeUnclassified++;
      holds.push({ rowIndex: r.rowIndex, reason: "grade_unclassified", note: `grade answer: ${r.gradeRaw || "(blank)"}` });
      continue;
    }
    gradedAll.push(r.grade);
    if (r.syllabus === null) {
      syllabusUnknown++;
      holds.push({ rowIndex: r.rowIndex, reason: "syllabus_unknown" });
      continue;
    }
    const consent = decideConsent(r);
    holds.push(...consent.holds);
    if (consent.level === null) {
      privateRecords++;
      continue;
    }
    seq += 1;
    const id = `MJ26-${String(seq).padStart(3, "0")}`;
    shareableGrades.push(r.grade);
    bySyllabus[r.syllabus].push(r.grade);
    if (consent.level === "named") named++;
    else anonymous++;
    if (consent.photoAllowed) {
      withPhoto++;
      photoManifest.push({ id, driveFileId: r.photoFileId!, rowIndex: r.rowIndex });
    }
    publicRecords.push({
      id,
      seq,
      grade: r.grade,
      syllabus: r.syllabus,
      level: consent.level,
      name: consent.level === "named" ? r.displayName : null,
      hasPhoto: consent.photoAllowed,
    });
  }

  for (const h of holds) holdsByReason[h.reason] += 1;

  // Unique students: a student is one e-mail+name identity; a multi-syllabus
  // student contributes >1 record.
  const identities = new Map<string, number>();
  for (const r of dedup.kept) {
    const k = `${r.emailKey}|${r.nameKey}`;
    identities.set(k, (identities.get(k) ?? 0) + 1);
  }
  const multiSyllabusStudents = [...identities.values()].filter((n) => n > 1).length;

  const shareable = gradeCounts(shareableGrades);
  const summary: Mj26Summary = {
    session: "May/June 2026",
    board: "Cambridge",
    rawResponses: raw.length,
    incompleteRows: holdsByReason.incomplete_row,
    exactDuplicatesRemoved: dedup.exactDuplicatesRemoved,
    ambiguousDuplicates: dedup.ambiguousDuplicates,
    uniqueRecords: dedup.kept.length,
    uniqueStudents: identities.size,
    multiSyllabusStudents,
    gradeUnclassified,
    syllabusUnknown,
    graded: gradeCounts(gradedAll),
    shareable: {
      ...shareable,
      named,
      anonymous,
      withPhoto,
      bySyllabus: {
        "1123": gradeCounts(bySyllabus["1123"]),
        "0500": gradeCounts(bySyllabus["0500"]),
        "0510": gradeCounts(bySyllabus["0510"]),
        "9093": gradeCounts(bySyllabus["9093"]),
      },
    },
    privateRecords,
    holdsByReason,
  };

  return {
    dataset: {
      version: 1,
      session: "May/June 2026",
      generatedAt: opts.generatedAt,
      sourceFingerprint: opts.sourceFingerprint,
      summary,
      records: publicRecords,
    },
    holds,
    photoManifest,
  };
}

/* ───────────────────────── public-safety validation ───────────────────────── */

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\s-]?){9,}/;
const DRIVE_RE = /drive\.google\.com|docs\.google\.com|[?&]id=[A-Za-z0-9_-]{20,}/;

/** Throws when the public dataset carries anything that should never leave the form. */
export function assertDatasetIsPublicSafe(dataset: Mj26Dataset): void {
  const scan: Partial<Mj26Dataset> = { ...dataset };
  delete scan.generatedAt;
  delete scan.sourceFingerprint;
  const text = JSON.stringify(scan);
  if (EMAIL_RE.test(text)) throw new Error("public dataset contains an e-mail address");
  if (PHONE_RE.test(text)) throw new Error("public dataset contains a phone-number-like sequence");
  if (DRIVE_RE.test(text)) throw new Error("public dataset contains a Drive link or file id");
  for (const r of dataset.records) {
    if (r.level === "anonymous" && r.name) throw new Error(`${r.id}: anonymous record carries a name`);
    if (r.level === "anonymous" && r.hasPhoto) throw new Error(`${r.id}: anonymous record carries a photo`);
    if (!GRADE_ORDER.includes(r.grade)) throw new Error(`${r.id}: invalid grade`);
  }
  const s = dataset.summary;
  if (dataset.records.length !== s.shareable.total) throw new Error("records length does not reconcile to shareable.total");
  const recomputed = gradeCounts(dataset.records.map((r) => r.grade));
  if (recomputed.aOrAStar !== s.shareable.aOrAStar || recomputed.aStar !== s.shareable.aStar) {
    throw new Error("summary A/A* counts do not reconcile to records");
  }
  if (s.shareable.named + s.shareable.anonymous !== s.shareable.total) throw new Error("named + anonymous ≠ shareable total");
  if (dataset.records.filter((r) => r.hasPhoto).length !== s.shareable.withPhoto) throw new Error("withPhoto does not reconcile");
  if (s.uniqueRecords !== s.rawResponses - s.incompleteRows - s.exactDuplicatesRemoved - s.ambiguousDuplicates) {
    throw new Error("uniqueRecords does not reconcile to raw − incomplete − duplicates");
  }
  if (s.graded.total !== s.uniqueRecords - s.gradeUnclassified) throw new Error("graded.total does not reconcile");
  if (s.shareable.total !== s.graded.total - s.syllabusUnknown - s.privateRecords) throw new Error("shareable.total does not reconcile");
}
