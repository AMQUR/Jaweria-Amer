#!/usr/bin/env npx tsx
/**
 * M/J 2026 results — data + component regression tests. Run with `npm test`.
 * Fails if: dedup logic changes counts, a private row becomes public, public
 * metrics stop reconciling, a record carries fields beyond its consent level,
 * the committed dataset/portrait map drift, or the showcase components lose
 * their three alternating rows / speed contract / reduced-motion fallback.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { csvToObjects, parseCsv } from "../src/lib/results/csv";
import {
  assertDatasetIsPublicSafe,
  buildMj26Dataset,
  decideConsent,
  dedupeRecords,
  normalizeGrade,
  normalizeResponse,
  normalizeShare,
  parseFormTimestamp,
  rowsToRawResponses,
  type Mj26Dataset,
} from "../src/lib/results/mj26-pipeline";
import { anonymousLabel, distributeRows, getMj26Headline, getMj26Results } from "../src/lib/results/public";
import { BASE_SPEED_PX_PER_SECOND, LOOP_TAIL_COUNT, ROW_DIRECTIONS, ROW_SPEED_FACTORS, rowSpeedFor } from "../src/components/results/result-capsule-rows";
import { selectHeadline } from "../src/components/results/results-headline";

let failed = 0;
const check = (label: string, ok: boolean) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed++;
};
const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

/* ── CSV parser ── */
const parsed = parseCsv('a,b,c\n1,"x, y","multi\nline"\n2,"say ""hi""",z\n');
check("csv: quoted comma, embedded newline, escaped quote", parsed.length === 3 && parsed[1][1] === "x, y" && parsed[1][2] === "multi\nline" && parsed[2][1] === 'say "hi"');

/* ── normalisation ── */
check("grade: A* variants", normalizeGrade("A*") === "A*" && normalizeGrade(" a* ") === "A*" && normalizeGrade("A star") === "A*");
check("grade: Other/blank → null (never a grade)", normalizeGrade("Other") === null && normalizeGrade("") === null && normalizeGrade("Pass") === null);
check("share answers", normalizeShare("Yes, with my name") === "named" && normalizeShare("Yes, but hide my name") === "anonymous" && normalizeShare("No, please keep it private") === "private" && normalizeShare("") === "missing");
check("timestamp parse", parseFormTimestamp("8/20/2026 10:09:34") > parseFormTimestamp("8/18/2026 23:59:59"));

/* ── fixture (synthetic, no real students) ── */
const H = [
  "Timestamp","Email Address","Full name","WhatsApp number","Which qualification did you take with us?","Where did you study with us?",
  "Your grade in English","Screenshot of your result","Can we share your result on Instagram, our website and WhatsApp?",
  "Are you comfortable with us posting a photo of you alongside it?","Your photo","Anything you want to say to Miss Jay?",
  "Would you record a short video testimonial for us?","Anything else you want us to know?",
];
const Q1123 = "O Level English Language (1123)";
const Q0500 = "IGCSE First Language English (0500)";
const SS = "https://drive.google.com/open?id=1SCREENSHOT000000000000000000";
const PH = "https://drive.google.com/open?id=1PHOTO0000000000000000000000000";
const YES_NAME = "Yes, with my name";
const YES_HIDE = "Yes, but hide my name";
const NO_PRIV = "No, please keep it private";
const PH_YES = "Yes, I will upload one below";
const PH_NO = "No, result only";
const PH_ALL = "No photo and no result, keep everything private";

const row = (ts: string, email: string, name: string, phone: string, qual: string, grade: string, share: string, photo: string, photoUrl = "") =>
  [ts, email, name, phone, qual, "Online", grade, SS, share, photo, photoUrl, "Thank you Miss Jay! Call me on 0300 1234567", "No thanks", ""];

const fixture: string[][] = [
  H,
  row("8/18/2026 10:00:00", "aisha@example.com", "Aisha Khan", "+92 300 1111111", Q1123, "A*", YES_NAME, PH_YES, PH), // 0 named + photo
  row("8/18/2026 10:01:00", "bilal@example.com", "bilal ahmed", "+92 300 2222222", Q1123, "A", YES_HIDE, PH_NO), // 1 anonymous
  row("8/18/2026 10:02:00", "sara@example.com", "Sara Malik", "+92 300 3333333", Q1123, "B", NO_PRIV, PH_ALL), // 2 private
  row("8/18/2026 10:03:00", "aisha@example.com", "Aisha Khan", "+92 300 1111111", Q1123, "A*", YES_NAME, PH_NO), // 3 exact dup of 0 (later) supersedes
  row("8/18/2026 10:04:00", "dan@example.com", "Daniyal Raza", "+92 300 4444444", Q1123, "Other", YES_NAME, PH_NO), // 4 unclassified grade
  row("8/18/2026 10:05:00", "hina@example.com", "Hina Sohail", "+92 300 5555555", Q0500, "A", YES_NAME, PH_ALL), // 5 conflict → private
  row("8/18/2026 10:06:00", "omar@example.com", "Omar Farooq", "+92 300 6666666", Q1123, "C", YES_HIDE, PH_YES, PH), // 6 hide name + photo → anon, no photo
  row("8/18/2026 10:07:00", "zoya@example.com", "Zoya Ali", "+92 300 7777777", Q1123, "A", "", ""), // 7 consent missing → private
  row("8/18/2026 10:08:00", "ali@example.com", "Ali Hassan", "+92 300 8888888", Q1123, "A*", YES_NAME, PH_YES), // 8 photo consent, no file
  row("8/18/2026 10:09:00", "twin@example.com", "Ahmed Ali", "+92 300 9999999", Q1123, "A", YES_NAME, PH_NO), // 9 name collision A
  row("8/18/2026 10:10:00", "other@example.com", "Ahmed Ali", "+92 300 0000000", Q1123, "B", NO_PRIV, PH_ALL), // 10 name collision B
  row("8/18/2026 10:11:00", "amb@example.com", "Amber Shah", "+92 300 1212121", Q1123, "A", YES_NAME, PH_NO), // 11 ambiguous dup ↓
  row("8/18/2026 10:12:00", "amb@example.com", "Amber Shah", "+92 300 1212121", Q1123, "B", YES_NAME, PH_NO), // 12 ambiguous dup ↑
  ["", "", "", "", "", "", "", "", "", "", "", "love you miss", "No thanks", ""], // 13 incomplete
];
const csvText = fixture.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n") + "\n";
const rows = csvToObjects(csvText);
check("fixture parses 14 data rows", rows.length === 14);

const normalized = rowsToRawResponses(rows).map(normalizeResponse);
const dedup = dedupeRecords(normalized);
check("dedup: exact duplicate removed, latest kept", dedup.exactDuplicatesRemoved === 1 && dedup.kept.some((r) => r.rowIndex === 3) && !dedup.kept.some((r) => r.rowIndex === 0));
check("dedup: ambiguous duplicate holds both rows", dedup.ambiguousDuplicates === 2 && !dedup.kept.some((r) => r.rowIndex === 11 || r.rowIndex === 12));
check("dedup: same name, different e-mail are two people", dedup.kept.some((r) => r.rowIndex === 9) && dedup.kept.some((r) => r.rowIndex === 10));
check("dedup: incomplete row dropped", dedup.holds.some((h) => h.rowIndex === 13 && h.reason === "incomplete_row"));
check("dedup: unique = 14 − 1 incomplete − 1 exact − 2 ambiguous", dedup.kept.length === 10);

check("consent: private stays private", decideConsent(normalized[2]).level === null);
const conflict = decideConsent(normalized[5]);
check("consent: 'keep everything private' overrides a Yes", conflict.level === null && conflict.holds[0].reason === "consent_conflict_private_photo_answer");
const anonPhoto = decideConsent(normalized[6]);
check("consent: hidden name never gets a photo", anonPhoto.level === "anonymous" && anonPhoto.photoAllowed === false);
check("consent: explicit name → named", decideConsent(normalized[9]).level === "named");
check("consent: photo only when allowed AND file supplied", decideConsent(normalized[8]).photoAllowed === false && decideConsent(normalized[0]).photoAllowed === true);

const { dataset, holds } = buildMj26Dataset(rows, { generatedAt: "2026-09-02T00:00:00.000Z", sourceFingerprint: "fixture" });
const s = dataset.summary;
check("summary: raw 14, unique 10, graded 9, shareable 5", s.rawResponses === 14 && s.uniqueRecords === 10 && s.graded.total === 9 && s.shareable.total === 5);
check("summary: 'Other' grade never in any denominator", s.gradeUnclassified === 1 && s.graded.byGrade["A*"] === 2 && s.graded.total === 9);
check("summary: private + missing + conflict = 4 private records", s.privateRecords === 4);
check("summary: shareable A/A* reconciles (A* 2 + A 2 = 4 of 5 = 80%)", s.shareable.aStar === 2 && s.shareable.a === 2 && s.shareable.aOrAStar === 4 && s.shareable.aOrAStarPct === 80);
check("summary: named 3 / anonymous 2 / photos 0", s.shareable.named === 3 && s.shareable.anonymous === 2 && s.shareable.withPhoto === 0);
check("records: private students are absent by name", !JSON.stringify(dataset).includes("Sara Malik") && !JSON.stringify(dataset).includes("Hina Sohail") && !JSON.stringify(dataset).includes("Zoya Ali"));
check("records: anonymous record has no name", dataset.records.every((r) => r.level !== "anonymous" || r.name === null));
check("records: stable archive ids in submission order", dataset.records[0].id === "MJ26-001" && dataset.records.every((r, i) => r.seq === i + 1));
check("records: no e-mail / phone / Drive link / testimonial text leaks", !JSON.stringify(dataset).match(/@example\.com|0300|drive\.google|love you|Thank you Miss Jay/));
let safe = true;
try { assertDatasetIsPublicSafe(dataset); } catch { safe = false; }
check("assertDatasetIsPublicSafe passes on fixture", safe);
check("holds: every hold has a reason and a row", holds.every((h) => typeof h.rowIndex === "number" && h.reason.length > 0));

const tampered: Mj26Dataset = JSON.parse(JSON.stringify(dataset));
tampered.records.push({ id: "MJ26-999", seq: 999, grade: "B", syllabus: "1123", level: "named", name: "Sara Malik", hasPhoto: false });
let tamperCaught = false;
try { assertDatasetIsPublicSafe(tampered); } catch { tamperCaught = true; }
check("tamper: an extra record breaks reconciliation", tamperCaught);

/* ── committed dataset ── */
const committed: Mj26Dataset = JSON.parse(read("src/lib/results/mj-2026.public.json"));
let ok = true;
try { assertDatasetIsPublicSafe(committed); } catch (e) { ok = false; console.log("   ", (e as Error).message); }
check("committed dataset is public-safe and reconciles", ok);
check("committed dataset: no 'Other' grade, every syllabus known", committed.records.every((r) => ["A*", "A", "B", "C", "D", "E", "U"].includes(r.grade) && ["1123", "0500", "0510", "9093"].includes(r.syllabus)));
check("committed dataset: shareable ≤ graded ≤ unique ≤ raw", committed.summary.shareable.total <= committed.summary.graded.total && committed.summary.graded.total <= committed.summary.uniqueRecords && committed.summary.uniqueRecords <= committed.summary.rawResponses);
const photos: Record<string, string> = JSON.parse(read("src/lib/results/mj-2026.photos.json"));
const allowed = new Set(committed.records.filter((r) => r.hasPhoto).map((r) => r.id));
check("committed portraits: every asset belongs to a photo-consented NAMED record", Object.keys(photos).every((id) => allowed.has(id)) && Object.keys(photos).every((id) => committed.records.find((r) => r.id === id)?.level === "named"));
check("committed portraits: site paths only, files present", Object.entries(photos).every(([id, p]) => p === `/results/mj-2026/${id}.webp` && fs.existsSync(path.join(root, "public", p))));
const audit = JSON.parse(read("src/lib/results/mj-2026.audit.json"));
check("audit: portraits published + held = consented with file", audit.portraits && audit.portraits.published + audit.portraits.held === audit.portraits.consentedWithFile && audit.portraits.published === Object.keys(photos).length);
check("audit: fingerprint matches dataset", audit.sourceFingerprint === committed.sourceFingerprint);

/* ── public accessor ── */
const { records } = getMj26Results();
const headline = getMj26Headline();
check("accessor: one public result per record", records.length === committed.records.length);
check("accessor: anonymous → 'Student #NNN', no name leak", records.filter((r) => r.anonymous).every((r) => r.displayName === anonymousLabel(r.archiveNumber) && !r.portraitUrl));
check("accessor: public fields only", records.every((r) => Object.keys(r).sort().join() === ["anonymous", "archiveNumber", "displayName", "grade", "id", "portraitUrl", "qualification", "syllabusCode"].join()));
check("accessor: A/A* % = aOrAStar / shared, one decimal", headline.aOrAStarPct === Math.round((headline.aOrAStar / headline.sharedResults) * 1000) / 10);
check("accessor: statistic sentence uses the shareable denominator", headline.statisticSentence === `${headline.aOrAStar} of ${headline.sharedResults} M/J 2026 result records shared with permission.`);
const rows3 = distributeRows(records, 3);
check("rows: three rows, every record exactly once, deterministic", rows3.length === 3 && rows3.flat().length === records.length && new Set(rows3.flat().map((r) => r.id)).size === records.length && JSON.stringify(distributeRows(records, 3).map((r) => r.map((x) => x.id))) === JSON.stringify(rows3.map((r) => r.map((x) => x.id))));
check("rows: no row is all A*", rows3.every((r) => r.some((x) => x.grade !== "A*")));
check("rows: balanced within 2", Math.max(...rows3.map((r) => r.length)) - Math.min(...rows3.map((r) => r.length)) <= 2);
const hl = selectHeadline(headline);
check("headline: 'the norm' only when A/A* ≥ 75%", (headline.aOrAStarPct >= 75) === (hl.key === "norm") && selectHeadline({ aOrAStarPct: 60, aStar: 10, aOrAStar: 20, sharedResults: 33 }).key === "count");

/* ── animation contract ── */
check("speed: desktop 26–32 px/s for every row", [0, 1, 2].every((i) => rowSpeedFor(1440, i) >= 26 && rowSpeedFor(1440, i) <= 32));
check("speed: tablet 22–28 px/s for every row", [0, 1, 2].every((i) => rowSpeedFor(800, i) >= 22 && rowSpeedFor(800, i) <= 28));
check("speed: mobile 18–24 px/s for every row", [0, 1, 2].every((i) => rowSpeedFor(375, i) >= 18 && rowSpeedFor(375, i) <= 24));
check("speed: rows vary only slightly (no racing)", Math.max(...ROW_SPEED_FACTORS) / Math.min(...ROW_SPEED_FACTORS) < 1.2 && BASE_SPEED_PX_PER_SECOND.desktop === 28);
check("directions: left / right / left", ROW_DIRECTIONS.join() === "left,right,left");
const rowsSrc = read("src/components/results/result-capsule-rows.tsx");
const css = read("src/app/globals.css");
check("rows: duration derived from measured segment width (no hardcoded duration)", rowsSrc.includes("segment.offsetWidth") && rowsSrc.includes("--results-duration") && !/duration:\s*40/.test(rowsSrc));
check("rows: full segment + short tail, animate exactly one segment width", css.includes("var(--results-loop, 0px)") && rowsSrc.includes("--results-loop") && rowsSrc.includes("row.slice(0, LOOP_TAIL_COUNT)") && LOOP_TAIL_COUNT >= 16);
check("rows: hover / focus-within / dialog / offscreen pause", css.includes(".results-row:hover .results-track") && css.includes(".results-row:focus-within .results-track") && css.includes('.results-track[data-paused="true"]') && rowsSrc.includes("selected !== null") && rowsSrc.includes("IntersectionObserver"));
check("rows: reduced motion → static wrapped grid, duplicates hidden, all results kept", css.includes("prefers-reduced-motion: reduce") && css.includes(".results-segment[data-dup] { display: none; }") && css.includes("flex-wrap: wrap"));
check("rows: duplicate tail is aria-hidden and untabbable", rowsSrc.includes('data-dup="" aria-hidden="true"') && read("src/components/results/result-capsule.tsx").includes("tabIndex={dup ? -1 : undefined}"));
check("capsule: button semantics, visible focus ring", read("src/components/results/result-capsule.tsx").includes('type="button"') && css.includes(".results-capsule:focus-visible { outline: 2px solid"));
check("dialog: focus returns to the opening capsule, 44px close target", read("src/components/results/result-detail-dialog.tsx").includes("finalFocus={returnFocusRef}") && read("src/components/results/result-detail-dialog.tsx").includes("h-12 w-12"));
check("homepage: showcase mounted directly after the hero", (() => { const p = read("src/app/(public)/page.tsx"); return p.indexOf("<ResultsShowcase />") > p.indexOf("{/* Hero */}") && p.indexOf("<ResultsShowcase />") < p.indexOf("{/* Stats"); })());
for (const f of fs.readdirSync(path.join(root, "src/components/results"))) {
  const t = read(`src/components/results/${f}`);
  check(`no demo identities/assets in ${f}`, !/Sarah Chen|SolaceUI|res\.cloudinary\.com|harshitproject|DataFlow/.test(t));
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll M/J 2026 results checks passed.");
