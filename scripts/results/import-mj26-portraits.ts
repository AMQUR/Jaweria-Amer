#!/usr/bin/env npx tsx
/**
 * Publish reviewed M/J 2026 portraits into the site.
 *
 *   npx tsx scripts/results/import-mj26-portraits.ts --from <dir-of-reviewed-320px-webp>
 *
 * Reads  scripts/source/mj26-photo-manifest.private.json  (private; produced by build-mj26-results.ts)
 *        <dir>/<archiveId>.webp                            (320×320 portraits, already visually reviewed)
 * Writes public/results/mj-2026/<archiveId>.webp           (public, committed)
 *        src/lib/results/mj-2026.photos.json               (public: archive id → site path)
 *        src/lib/results/mj-2026.audit.json → portraits    (counts + editorial holds by archive id)
 *
 * A portrait is imported only when ALL hold:
 *   1. the archive id is in the manifest — i.e. the record is public, NAMED, the
 *      student answered "Yes, I will upload one below" AND supplied a file;
 *   2. the id is not in PORTRAIT_HOLDS (editorial review);
 *   3. a valid WebP file for that id exists in --from.
 * Anything else is skipped and reported. The result itself stays public either way.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const args = process.argv.slice(2);
const fromArg = args.includes("--from") ? args[args.indexOf("--from") + 1] : "";
if (!fromArg) {
  console.error("usage: import-mj26-portraits.ts --from <dir>");
  process.exit(2);
}
const root = process.cwd();
const fromDir = path.resolve(root, fromArg);
const manifestPath = path.resolve(root, "scripts/source/mj26-photo-manifest.private.json");
if (!fs.existsSync(manifestPath)) {
  console.error(`manifest not found: ${manifestPath} — run scripts/results/build-mj26-results.ts first`);
  process.exit(2);
}
const manifest: Array<{ id: string; driveFileId: string }> = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

/**
 * Editorial holds after visual review of the consented uploads (contact sheet
 * reviewed 2026-09-02 for the English With Miss Jay showcase and re-reviewed
 * for this site). A consented upload is still held when it is not a portrait
 * of the student alone: third-party people who did not consent, third-party
 * branding, a public figure's photo, or no person at all.
 */
export const PORTRAIT_HOLDS: Record<string, string> = {
  "MJ26-127": "not the student — public figure's photo",
  "MJ26-170": "no person in frame",
  "MJ26-173": "no face in frame",
  "MJ26-181": "upload is a video, not a photograph",
  "MJ26-284": "group photo — other people did not consent",
  "MJ26-285": "third-party institution graphic",
};

const outDir = path.resolve(root, "public/results/mj-2026");
fs.mkdirSync(outDir, { recursive: true });

function isWebp(buf: Buffer): boolean {
  return buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
}

const published: Record<string, string> = {};
const skipped: Array<{ id: string; reason: string }> = [];
for (const m of manifest) {
  if (PORTRAIT_HOLDS[m.id]) {
    skipped.push({ id: m.id, reason: `held after review: ${PORTRAIT_HOLDS[m.id]}` });
    continue;
  }
  const src = path.join(fromDir, `${m.id}.webp`);
  if (!fs.existsSync(src)) {
    skipped.push({ id: m.id, reason: "no reviewed portrait file" });
    continue;
  }
  const buf = fs.readFileSync(src);
  if (!isWebp(buf)) {
    skipped.push({ id: m.id, reason: "not a WebP file" });
    continue;
  }
  if (buf.length > 120 * 1024) {
    skipped.push({ id: m.id, reason: `too large (${Math.round(buf.length / 1024)} KB)` });
    continue;
  }
  fs.writeFileSync(path.join(outDir, `${m.id}.webp`), buf);
  published[m.id] = `/results/mj-2026/${m.id}.webp`;
}

// Remove anything in the public folder that is no longer approved.
for (const f of fs.readdirSync(outDir)) {
  const id = f.replace(/\.webp$/, "");
  if (!published[id]) fs.unlinkSync(path.join(outDir, f));
}

const photosPath = path.resolve(root, "src/lib/results/mj-2026.photos.json");
const ordered = Object.fromEntries(Object.keys(published).sort().map((k) => [k, published[k]]));
fs.writeFileSync(photosPath, JSON.stringify(ordered, null, 2) + "\n");

const auditPath = path.resolve(root, "src/lib/results/mj-2026.audit.json");
const audit = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, "utf8")) : {};
audit.portraits = {
  consentedWithFile: manifest.length,
  published: Object.keys(published).length,
  held: skipped.length,
  holds: skipped,
};
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + "\n");

console.log(`✓ ${Object.keys(published).length} portraits → public/results/mj-2026/ and ${path.relative(root, photosPath)}`);
if (skipped.length) console.log("skipped:", JSON.stringify(skipped));
