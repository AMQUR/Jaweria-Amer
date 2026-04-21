/**
 * Copy PDFs from local folders (e.g. Google Drive exports) into `public/resources/{notes,...}/`
 * and regenerate `src/lib/resource-supplements.ts` with duplicate detection.
 *
 * Usage (from `jaweria-amer/`):
 *   npx tsx scripts/ingest-resources.ts
 *
 * Edit `SCAN_ROOTS` if your download paths differ.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import type { Resource } from "../src/lib/data";
import { resources as existingResources } from "../src/lib/data";
import { supplementalHubResources as priorSupplements } from "../src/lib/resource-supplements";
import {
  findFirstDuplicate,
  hubCategoryForDiskFolder,
  inferResourceFieldsFromFilename,
  slugifyFileStem,
} from "../src/lib/resource-ingestion";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const PUBLIC_RESOURCES = join(PROJECT_ROOT, "public", "resources");

/** Student scripts / examiner-style PDFs (hub category `examiner-reports` → UI label “Scripts”). */
const SCRIPTS_DOWNLOAD_FOLDER = join(process.env.HOME ?? "", "Downloads", "Scripts");

/** Absolute paths to scan (recursive). */
const SCAN_ROOTS = [
  join(process.env.HOME ?? "", "Downloads", "Summary Writing"),
  join(process.env.HOME ?? "", "Downloads", "Past Papers"),
  join(process.env.HOME ?? "", "Downloads", "Topicals"),
  SCRIPTS_DOWNLOAD_FOLDER,
];

type DiskFolder = "notes" | "worksheets" | "past-papers" | "examiner-reports" | "checklists";

/** If both `slug` and `slug-2` exist (re-ingest collision), keep the unsuffixed id. */
function dropNumericSuffixDuplicateIds(resources: Resource[]): Resource[] {
  const ids = new Set(resources.map((r) => r.id));
  return resources.filter((r) => {
    const m = r.id.match(/^(.+)-(\d+)$/);
    if (!m) return true;
    const base = m[1] ?? "";
    return base.length === 0 || !ids.has(base);
  });
}

function inferDiskFolder(absPath: string): DiskFolder {
  const p = absPath.toLowerCase();
  const scriptsRoot = SCRIPTS_DOWNLOAD_FOLDER.toLowerCase();
  if (scriptsRoot.length > 0 && p.startsWith(scriptsRoot)) return "examiner-reports";
  if (p.includes("past papers") && p.includes("marking schemes")) return "past-papers";
  if (p.includes("past papers") && p.includes("solved solutions")) return "worksheets";
  if (p.includes("summary writing") && p.includes("past papers")) return "notes";
  if (p.includes("summary writing")) return "notes";
  if (p.includes("topicals") && p.includes("summaries")) return "notes";
  if (p.includes("topicals")) return "worksheets";
  return "worksheets";
}

function walkPdfFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkPdfFiles(p, acc);
    else if (st.isFile() && extname(name).toLowerCase() === ".pdf") acc.push(p);
  }
  return acc;
}

function uniqueDestSlug(originalBase: string, destDir: string): string {
  let stem = slugifyFileStem(originalBase.replace(/\.pdf$/i, ""));
  if (!stem) stem = "resource";
  let candidate = stem;
  let n = 0;
  while (existsSync(join(destDir, `${candidate}.pdf`))) {
    n += 1;
    candidate = `${stem}-${n}`;
  }
  return candidate;
}

function main() {
  let skipped = 0;
  const collected: Resource[] = [];
  const pool: Resource[] = [...existingResources];

  for (const root of SCAN_ROOTS) {
    const files = walkPdfFiles(root);
    for (const abs of files) {
      const diskFolder = inferDiskFolder(abs);
      const hubCategory = hubCategoryForDiskFolder(diskFolder);
      const destDir = join(PUBLIC_RESOURCES, diskFolder);
      mkdirSync(destDir, { recursive: true });

      const origBase = basename(abs);
      const slug = uniqueDestSlug(origBase, destDir);
      const fileUrl = `/resources/${diskFolder}/${slug}.pdf`;

      const fields = inferResourceFieldsFromFilename(origBase, hubCategory);
      const rel = relative(PROJECT_ROOT, abs);
      const paper =
        /paper\s*1|\/paper 1\/|p1\b|directed/i.test(rel + origBase)
          ? "Paper 1"
          : /paper\s*2|\/paper 2\/|p2\b|comprehension|summary/i.test(rel + origBase)
            ? "Paper 2"
            : fields.paper;

      const candidate: Resource = {
        id: slug,
        title: fields.title,
        category: hubCategory,
        subject: "English Language 1123",
        level: "O Level",
        paper,
        year: fields.year,
        fileUrl,
        description: fields.description,
      };

      const dup = findFirstDuplicate(candidate, pool);
      if (dup) {
        skipped += 1;
        console.log(`Duplicate skipped: ${origBase}`);
        continue;
      }

      copyFileSync(abs, join(destDir, `${slug}.pdf`));
      pool.push(candidate);
      collected.push(candidate);
    }
  }

  const byId = new Map<string, Resource>();
  for (const r of priorSupplements) byId.set(r.id, r);
  for (const r of collected) byId.set(r.id, r);
  const merged = dropNumericSuffixDuplicateIds(Array.from(byId.values()));

  const outPath = join(PROJECT_ROOT, "src", "lib", "resource-supplements.ts");
  const body = `import type { Resource } from "./data";

/** Auto-generated by \`scripts/ingest-resources.ts\` — ${collected.length} new file(s), ${merged.length} total, ${skipped} duplicate(s) skipped. */
export const supplementalHubResources: Resource[] = ${JSON.stringify(merged, null, 2)};
`;
  writeFileSync(outPath, body, "utf8");
  console.log(
    `Wrote ${merged.length} total supplemental resources (${collected.length} new this run); duplicates skipped: ${skipped}`
  );
}

main();
