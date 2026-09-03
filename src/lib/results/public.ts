/**
 * Public accessor for the M/J 2026 results dataset.
 *
 * Reads the committed, public-safe JSON produced by
 * `scripts/results/build-mj26-results.ts` and the portrait map produced by
 * `scripts/results/import-mj26-portraits.ts`. No I/O at request time; safe in
 * server and client components (the data is public by construction).
 */
import dataset from "./mj-2026.public.json";
import photos from "./mj-2026.photos.json";
import type { GradeLabel, Mj26Dataset, Mj26Summary, PublicResultRecord, SyllabusCode } from "./mj26-pipeline";

export type { GradeLabel, SyllabusCode };

export interface PublicResult {
  /** Stable archive id, e.g. "MJ26-042". */
  id: string;
  /** Archive number (1-based, submission order). */
  archiveNumber: number;
  /** Approved name, or the anonymous label. */
  displayName: string;
  grade: GradeLabel;
  qualification: string;
  syllabusCode: SyllabusCode;
  /** Site-relative path of the approved 320px portrait, or null. */
  portraitUrl: string | null;
  anonymous: boolean;
}

const PHOTO_MAP = photos as Record<string, string>;
const DATA = dataset as unknown as Mj26Dataset;

export const SYLLABUS_LABEL: Record<SyllabusCode, string> = {
  "1123": "O Level English Language",
  "0500": "IGCSE First Language English",
  "0510": "IGCSE English as a Second Language",
  "9093": "AS & A Level English Language",
};

export const SESSION_LABEL = "May / June 2026";

/** Anonymous records are shown as their archive number — intentional, never "broken". */
export function anonymousLabel(seq: number): string {
  return `Student #${String(seq).padStart(3, "0")}`;
}

function toPublicResult(r: PublicResultRecord): PublicResult {
  const portrait = r.hasPhoto ? PHOTO_MAP[r.id] : undefined;
  return {
    id: r.id,
    archiveNumber: r.seq,
    displayName: r.level === "named" && r.name ? r.name : anonymousLabel(r.seq),
    grade: r.grade,
    qualification: SYLLABUS_LABEL[r.syllabus],
    syllabusCode: r.syllabus,
    portraitUrl: portrait ?? null,
    anonymous: r.level !== "named",
  };
}

let cache: { summary: Mj26Summary; records: PublicResult[]; generatedAt: string; portraitsPublished: number } | null = null;

export function getMj26Results() {
  if (cache) return cache;
  const records = DATA.records.map(toPublicResult);
  cache = {
    summary: DATA.summary,
    records,
    generatedAt: DATA.generatedAt,
    portraitsPublished: records.filter((r) => r.portraitUrl).length,
  };
  return cache;
}

/**
 * Headline metrics shown on the public surfaces. Every figure is taken from
 * the shareable subset (students who agreed to public sharing), never the
 * full response set — see docs/results/MJ26_RESULTS_METHODOLOGY.md.
 */
export function getMj26Headline() {
  const { summary } = getMj26Results();
  const s = summary.shareable;
  return {
    sharedResults: s.total,
    aStar: s.aStar,
    a: s.a,
    aOrAStar: s.aOrAStar,
    aOrAStarPct: s.aOrAStarPct ?? 0,
    aStarPct: s.aStarPct ?? 0,
    named: s.named,
    anonymous: s.anonymous,
    /** e.g. "252 of 293 M/J 2026 result records shared with permission." */
    statisticSentence: `${s.aOrAStar} of ${s.total} M/J 2026 result records shared with permission.`,
  };
}

/**
 * Deterministic distribution of every public record across the moving rows.
 * Portraits, named and anonymous records are interleaved so no row is a block
 * of one kind and no row is "all A*"; the order is fixed at build time.
 */
export function distributeRows(records: PublicResult[], rows = 3): PublicResult[][] {
  const pools = [
    records.filter((r) => r.portraitUrl),
    records.filter((r) => !r.portraitUrl && !r.anonymous),
    records.filter((r) => r.anonymous),
  ];
  const out: PublicResult[][] = Array.from({ length: rows }, () => []);
  let placed = 0;
  let i = 0;
  while (placed < records.length) {
    for (const pool of pools) {
      const item = pool.shift();
      if (!item) continue;
      out[i % rows].push(item);
      i++;
      placed++;
    }
  }
  return out;
}

export function gradeTone(grade: GradeLabel): "top" | "high" | "solid" {
  if (grade === "A*") return "top";
  if (grade === "A") return "high";
  return "solid";
}
