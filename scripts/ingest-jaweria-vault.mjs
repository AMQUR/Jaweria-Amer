/**
 * Copies Topicals (Paper 1) into public/resources/topicals/paper-1/
 * Usage (from jaweria-amer): node scripts/ingest-jaweria-vault.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const TOPICALS_SRC = "/Users/saad/Downloads/Jaweria Resources/Topicals/Paper 1";
const OUT_ROOT = path.join(process.cwd(), "public/resources/topicals/paper-1");

function slugify(basename) {
  return (
    basename
      .replace(/\.pdf$/i, "")
      .replace(/^copy\s+of\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 88) || "file"
  );
}

function walkPdf(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walkPdf(p));
    else if (name.name.toLowerCase().endsWith(".pdf")) out.push(p);
  }
  return out;
}

function relUnderTopicals(abs) {
  return path.relative(TOPICALS_SRC, abs);
}

function destFor(rel) {
  const r = rel.replace(/\\/g, "/").toLowerCase();
  const base = path.basename(rel);
  const slug = slugify(base) + ".pdf";
  if (r.includes("comprehensions") && r.includes("question")) {
    return `comprehension/qp/${slug}`;
  }
  if (r.includes("comprehensions") && r.includes("marking")) {
    return `comprehension/ms/${slug}`;
  }
  if (r.includes("summaries") && r.includes("question")) {
    return `summary/qp/${slug}`;
  }
  if (r.includes("summaries") && r.includes("marking")) {
    return `summary/ms/${slug}`;
  }
  return `misc/${slug}`;
}

const files = walkPdf(TOPICALS_SRC).sort((a, b) => relUnderTopicals(a).localeCompare(relUnderTopicals(b)));

let n = 0;
for (const abs of files) {
  const rel = relUnderTopicals(abs);
  const destRel = destFor(rel);
  const outPath = path.join(OUT_ROOT, destRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.copyFileSync(abs, outPath);
  const fileUrl = `/resources/topicals/paper-1/${destRel.replace(/\\/g, "/")}`;
  const id = `topical-p1-${crypto.createHash("sha1").update(fileUrl).digest("hex").slice(0, 12)}`;
  const baseTitle = path.basename(abs, ".pdf");
  const section = destRel.startsWith("comprehension/") ? "Comprehension" : "Summary";
  console.log(JSON.stringify({ rel, fileUrl, id, title: baseTitle, section }));
  n += 1;
  console.error("Added:", rel, "->", fileUrl);
}
console.error("Total topical files copied:", n);
