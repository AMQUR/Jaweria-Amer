#!/usr/bin/env node
/**
 * Privacy leakage gate for the M/J 2026 results feature. Plain Node (no tsx)
 * so it can run as `prebuild` / `postbuild` on Vercel.
 *
 *   node scripts/results/verify-mj26-public.mjs            # public artifacts + portraits + component sources
 *   node scripts/results/verify-mj26-public.mjs --built    # …plus the static build output in .next/server/app
 *
 * Fails (exit 1) when anything that must never leave the form appears in the
 * public artifacts: form column headers, e-mail addresses, phone-number
 * sequences, Drive links/file ids, raw form metadata, or — when the private
 * source export is present locally — any e-mail / phone / private student
 * name from the export.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const root = process.cwd();
const built = process.argv.includes("--built");
const failures = [];
const notes = [];

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

/* ── forbidden patterns (public artifacts) ── */
const FORM_HEADERS = [
  "Email Address",
  "WhatsApp number",
  "Screenshot of your result",
  "Can we share your result on Instagram",
  "Are you comfortable with us posting a photo",
  "Anything you want to say to Miss Jay",
  "Would you record a short video testimonial",
  "Anything else you want us to know",
  "Upload your scripts here",
];
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\s-]?){9,}/;
const DRIVE_RE = /drive\.google\.com|docs\.google\.com|[?&]id=[A-Za-z0-9_-]{20,}/;
const TIMESTAMP_RE = /\b\d{1,2}\/\d{1,2}\/20\d{2}\s+\d{1,2}:\d{2}:\d{2}\b/;

function scanText(label, text, { allowEmail = false } = {}) {
  for (const h of FORM_HEADERS) if (text.includes(h)) failures.push(`${label}: contains form header "${h}"`);
  if (!allowEmail && EMAIL_RE.test(text)) failures.push(`${label}: contains an e-mail address`);
  if (PHONE_RE.test(text)) failures.push(`${label}: contains a phone-number-like sequence`);
  if (DRIVE_RE.test(text)) failures.push(`${label}: contains a Drive link or file id`);
  if (TIMESTAMP_RE.test(text)) failures.push(`${label}: contains a raw form timestamp`);
}

/* ── 1. public dataset ── */
const publicPath = "src/lib/results/mj-2026.public.json";
if (!exists(publicPath)) failures.push(`${publicPath} missing — run npm run results:build`);
const dataset = exists(publicPath) ? JSON.parse(read(publicPath)) : null;
if (dataset) {
  const scan = { ...dataset };
  delete scan.generatedAt;
  scan.sourceFingerprint = "";
  scanText(publicPath, JSON.stringify(scan));
  const ALLOWED_KEYS = new Set(["id", "seq", "grade", "syllabus", "level", "name", "hasPhoto"]);
  for (const r of dataset.records) {
    for (const k of Object.keys(r)) if (!ALLOWED_KEYS.has(k)) failures.push(`${publicPath}: record ${r.id} carries unexpected field "${k}"`);
    if (r.level === "anonymous" && r.name) failures.push(`${publicPath}: anonymous record ${r.id} carries a name`);
    if (r.level === "anonymous" && r.hasPhoto) failures.push(`${publicPath}: anonymous record ${r.id} carries a photo`);
  }
  notes.push(`${publicPath}: ${dataset.records.length} records, fields ${[...ALLOWED_KEYS].join("/")}`);
}

/* ── 2. audit + photo map ── */
for (const p of ["src/lib/results/mj-2026.audit.json", "src/lib/results/mj-2026.photos.json"]) {
  if (!exists(p)) { failures.push(`${p} missing`); continue; }
  const text = read(p);
  scanText(p, text.replace(/"generatedAt": "[^"]+"/, "").replace(/"sourceFingerprint": "[^"]+"/, ""));
  if (p.endsWith("photos.json") && dataset) {
    const photos = JSON.parse(text);
    const allowed = new Map(dataset.records.filter((r) => r.hasPhoto).map((r) => [r.id, r]));
    for (const [id, url] of Object.entries(photos)) {
      if (!allowed.has(id)) failures.push(`${p}: ${id} is not a photo-consented named record`);
      if (!/^\/results\/mj-2026\/MJ26-\d{3}\.webp$/.test(url)) failures.push(`${p}: ${id} has a non-site path ${url}`);
      if (!exists(`public${url}`)) failures.push(`${p}: ${id} asset missing at public${url}`);
    }
    // every published portrait file must be in the map (no orphan portraits)
    const dir = "public/results/mj-2026";
    if (exists(dir)) {
      for (const f of fs.readdirSync(path.join(root, dir))) {
        const id = f.replace(/\.webp$/, "");
        if (!photos[id]) failures.push(`${dir}/${f}: portrait file not in the approved map`);
        if (!/^MJ26-\d{3}\.webp$/.test(f)) failures.push(`${dir}/${f}: unexpected file name`);
      }
    }
    notes.push(`${p}: ${Object.keys(photos).length} approved portraits`);
  }
}

/* ── 3. component sources: no demo identities / assets from the reference ── */
const DEMO = ["Sarah Chen", "Marcus Rodriguez", "Olivia Koe", "David Kim", "Amara Okonkwo", "James Mitchell", "Elena Rodriguez", "Michael Chang", "Sofia Weber", "SolaceUI", "res.cloudinary.com", "harshitproject", "DataFlow"];
const compDir = "src/components/results";
if (exists(compDir)) {
  for (const f of fs.readdirSync(path.join(root, compDir))) {
    const text = read(`${compDir}/${f}`);
    for (const d of DEMO) if (text.includes(d)) failures.push(`${compDir}/${f}: contains demo identity/asset "${d}"`);
    if (/duration:\s*40\b/.test(text)) failures.push(`${compDir}/${f}: hardcoded reference duration 40`);
  }
}

/* ── 4. private-source cross-check (local only) ── */
const sourcePath = process.env.MJ26_RESULTS_SOURCE || "scripts/source/mj26_source.csv";
let privateTerms = null;
if (exists(sourcePath) && dataset) {
  const csv = read(sourcePath);
  const emails = new Set([...csv.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map((m) => m[0].toLowerCase()));
  const phones = new Set([...csv.matchAll(/\+?\d[\d\s-]{8,}\d/g)].map((m) => m[0].replace(/\D/g, "")).filter((d) => d.length >= 9));
  const driveIds = new Set([...csv.matchAll(/[?&]id=([A-Za-z0-9_-]{20,})/g)].map((m) => m[1]));
  privateTerms = { emails, phones, driveIds };
  const publicText = JSON.stringify(dataset) + read("src/lib/results/mj-2026.audit.json") + read("src/lib/results/mj-2026.photos.json");
  for (const e of emails) if (publicText.toLowerCase().includes(e)) failures.push(`source e-mail leaked into public artifacts`);
  for (const d of driveIds) if (publicText.includes(d)) failures.push(`source Drive file id leaked into public artifacts`);
  const digits = publicText.replace(/[^\d]/g, " ");
  for (const ph of phones) if (digits.includes(ph)) failures.push(`source phone number leaked into public artifacts`);
  notes.push(`private cross-check: ${emails.size} e-mails, ${phones.size} phones, ${driveIds.size} Drive ids — none in public artifacts`);
} else {
  notes.push("private source not present — pattern scan only (expected on CI/Vercel)");
}

/* ── 5. static build output ── */
if (built) {
  const appDir = ".next/server/app";
  if (!exists(appDir)) {
    notes.push(`${appDir} not found — skipped built-output scan`);
  } else {
    const files = [];
    const walk = (d) => {
      for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
        const p = `${d}/${e.name}`;
        if (e.isDirectory()) walk(p);
        else if (/\.(html|rsc|body|txt|json)$/.test(e.name) && !/manifest/.test(e.name)) files.push(p);
      }
    };
    walk(appDir);
    // Generic phrases that legitimately occur in site copy (e.g. the privacy
    // policy says "WhatsApp number") are not evidence of a leak on their own;
    // only the form-specific question texts are.
    const BUILT_HEADERS = FORM_HEADERS.filter((h) => !["WhatsApp number", "Email Address"].includes(h));
    let scanned = 0;
    for (const f of files) {
      const text = read(f);
      scanned++;
      for (const h of BUILT_HEADERS) if (text.includes(h)) failures.push(`${f}: contains form header "${h}"`);
      if (DRIVE_RE.test(text)) failures.push(`${f}: contains a Drive link or file id`);
      if (privateTerms) {
        const lower = text.toLowerCase();
        for (const e of privateTerms.emails) if (lower.includes(e)) failures.push(`${f}: source e-mail leaked into build output`);
        for (const d of privateTerms.driveIds) if (text.includes(d)) failures.push(`${f}: source Drive id leaked into build output`);
      }
    }
    notes.push(`built output: scanned ${scanned} files under ${appDir}`);
  }
  // client bundles must never contain Supabase service keys or the source path
  const chunks = ".next/static/chunks";
  if (exists(chunks)) {
    let hit = 0;
    const walk = (d) => {
      for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
        const p = `${d}/${e.name}`;
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".js")) {
          const t = read(p);
          if (/SUPABASE_SERVICE_ROLE_KEY|mj26_source\.csv|service_role/.test(t)) { hit++; failures.push(`${p}: client bundle references a private secret/source`); }
        }
      }
    };
    walk(chunks);
    notes.push(`client chunks: no private references (${hit} hits)`);
  }
}

for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.error(`\n✗ M/J 2026 public-safety gate failed:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log(`✓ M/J 2026 public-safety gate passed${built ? " (including built output)" : ""}`);
