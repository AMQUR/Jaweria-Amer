/**
 * Student-facing resource visibility contract.
 *
 * Directed Writing is the only educational area withheld from students; everything
 * else in the vault must reach the public hub. Run with `npm test`.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { resources, staticResources, RESOURCE_HUB_CATEGORIES, NOTES_HUB_SUBTOPICS } from "@/lib/data";
import { normalizeTopicalsResource } from "@/lib/resource-ingestion";
import { mcqSets } from "@/lib/mcq-data";
import { isDirectedWritingLabel, isDirectedWritingResource } from "@/lib/resource-visibility";

let failures = 0;

function assert(condition: unknown, message: string) {
  if (!condition) {
    failures += 1;
    console.error(`  ✗ ${message}`);
    return;
  }
  console.log(`  ✓ ${message}`);
}

// Mirrors `getPublicResources()` (src/lib/public-cms.ts). That module is `server-only`
// and cannot be required here, so the wiring is asserted from source below instead.
const publicCms = readFileSync(join(process.cwd(), "src/lib/public-cms.ts"), "utf-8");
const publicResources = resources.map((r) => normalizeTopicalsResource(r));

console.log("\nDirected Writing matcher");
for (const variant of [
  "Directed Writing",
  "directed-writing",
  "DIRECTED WRITING",
  "directed_writing",
  "  Directed   Writing  ",
  "directed writings",
  "All Directed Writings",
]) {
  assert(isDirectedWritingLabel(variant), `"${variant}" is matched as Directed Writing`);
}

console.log("\nMatcher must not over-match legitimate content");
for (const safe of [
  "Essay Writing",
  "Summary Writing",
  "Creative Writing Workshop",
  "Writing",
  "General Writing",
  "writers-effect-worksheet",
  "Comprehension",
  "Vocabulary",
  null,
  undefined,
  "",
]) {
  assert(!isDirectedWritingLabel(safe), `"${safe}" is not treated as Directed Writing`);
}

// A resource whose title contains "writing" but is not Directed Writing must survive.
assert(
  !isDirectedWritingResource({
    id: "notes-essay-writing-structure",
    title: "Essay Writing — Structure",
    category: "general-notes",
    subCategory: "essay-writing",
    section: "Essay Writing",
    fileUrl: "https://example.supabase.co/storage/v1/object/public/resources/notes/essay-writing-structure.pdf",
  }),
  "an Essay Writing resource is not classified as Directed Writing"
);

console.log("\nDirected Writing is absent from every student-facing list");
assert(
  /import \{ resources as publicResources \} from "@\/lib\/data"/.test(publicCms) &&
    publicCms.includes("return withStrictTopicals(publicResources)"),
  "getPublicResources() reads the filtered `resources` export, not `staticResources`"
);

for (const [label, list] of [
  ["resources export", resources],
  ["public-cms projection", publicResources],
] as const) {
  const leaked = list.filter((r) => isDirectedWritingResource(r));
  assert(leaked.length === 0, `${label} exposes no Directed Writing items (found ${leaked.length})`);
}

const leakedByField = publicResources.filter((r) =>
  [r.id, r.title, r.section, r.subCategory, r.fileUrl].some(isDirectedWritingLabel)
);
assert(
  leakedByField.length === 0,
  `no public resource leaks Directed Writing via id/title/section/subCategory/fileUrl (found ${leakedByField.length})`
);

console.log("\nDirected Writing data is preserved (hidden, not deleted)");
const hiddenCount = staticResources.filter((r) => isDirectedWritingResource(r)).length;
assert(hiddenCount > 0, `Directed Writing records still exist in staticResources (${hiddenCount})`);
assert(
  staticResources.length === resources.length + hiddenCount,
  "public list differs from the admin list only by the Directed Writing items"
);

console.log("\nEvery other student area is visible");
const publicCategories = new Set(publicResources.map((r) => r.category));
for (const cat of ["general-notes", "topicals", "yearly-past-papers", "examiner-reports", "checklists", "quick-worksheets", "vocabulary", "solved-papers"] as const) {
  assert(publicCategories.has(cat), `category "${cat}" has student-visible resources`);
}

const publicSubCategories = new Set(publicResources.map((r) => r.subCategory).filter(Boolean));
for (const sub of ["comprehension", "essay-writing", "grammar", "summary-writing", "comprehension-vocabulary"] as const) {
  assert(publicSubCategories.has(sub), `subcategory "${sub}" has student-visible resources`);
}

// Vocabulary grouping: Resources → Vocabulary → Comprehension Vocabulary.
const comprehensionVocab = publicResources.filter(
  (r) => r.category === "vocabulary" && r.subCategory === "comprehension-vocabulary"
);
assert(comprehensionVocab.length >= 3, `Comprehension Vocabulary keeps its bank (${comprehensionVocab.length} items)`);

console.log("\nYearlies keep separate sections");
const yearlies = publicResources.filter((r) => r.category === "yearly-past-papers");
const hasInsert = yearlies.some((r) => `${r.paper} ${r.title} ${r.section}`.toLowerCase().includes("insert"));
const hasSpecimen = yearlies.some((r) => `${r.title} ${r.section}`.toLowerCase().includes("specimen"));
const hasQuestionPapers = yearlies.some(
  (r) => r.section === "question-papers" || r.title.toLowerCase().includes("question paper")
);
assert(hasInsert, "Yearlies expose Inserts");
assert(hasSpecimen, "Yearlies expose Specimens");
assert(hasQuestionPapers, "Yearlies expose Question Papers");

console.log("\nSolved Papers are restored");
const solved = publicResources.filter((r) => r.category === "solved-papers" || r.subCategory === "solved-papers");
assert(solved.length > 0, `Solved Papers are student-visible (${solved.length} items)`);
const solvedSessions = new Set(
  solved.map((r) => `${r.title} ${r.year} ${r.fileUrl}`.toLowerCase()).flatMap((h) =>
    ["w24", "w25", "s24", "s25"].filter((s) => h.includes(s))
  )
);
assert(solvedSessions.size > 0, `Solved Papers cover exam sessions: ${[...solvedSessions].sort().join(", ") || "none detected"}`);

console.log("\nNo category is withheld in the hub UI");
const hub = readFileSync(join(process.cwd(), "src/components/resources-hub.tsx"), "utf-8");
const hiddenSet = hub.match(/HIDDEN_RESOURCE_CATEGORIES = new Set<ResourceHubCategory>\(\[([^\]]*)\]\)/);
assert(hiddenSet != null, "hub declares HIDDEN_RESOURCE_CATEGORIES");
assert((hiddenSet?.[1] ?? "x").trim().length === 0, "HIDDEN_RESOURCE_CATEGORIES is empty — no legitimate category is hidden");
for (const cat of RESOURCE_HUB_CATEGORIES) {
  assert(!isDirectedWritingLabel(cat.label), `hub category "${cat.label}" is not Directed Writing`);
}
assert(
  NOTES_HUB_SUBTOPICS.some((t) => t.id === "directed-writing"),
  "Directed Writing remains defined in the data layer (hidden at the student boundary, not deleted)"
);
assert(
  hub.includes("withoutDirectedWritingLabels(NOTES_HUB_SUBTOPICS)"),
  "notes topic tiles are filtered through the shared visibility helper"
);

console.log("\nData integrity of the student-visible list");
const ids = new Set<string>();
for (const r of publicResources) {
  if (ids.has(r.id)) {
    failures += 1;
    console.error(`  ✗ duplicate id: ${r.id}`);
  }
  ids.add(r.id);
}
assert(ids.size === publicResources.length, `all ${publicResources.length} student-visible ids are unique`);

const missingFields = publicResources.filter((r) => !r.id || !r.title || !r.category);
assert(missingFields.length === 0, `every student-visible resource has id, title, and category (${missingFields.length} bad)`);

const badUrls = publicResources.filter((r) => r.type !== "mcq" && !/^https:\/\//.test(r.fileUrl));
assert(
  badUrls.length === 0,
  `no student-visible download points at a local /resources/*.pdf path (${badUrls.map((r) => r.id).join(", ") || "none"})`
);

const orphanMcqs = publicResources.filter((r) => r.type === "mcq" && !mcqSets[r.id]);
assert(orphanMcqs.length === 0, `every interactive assessment resolves its MCQ set (${orphanMcqs.map((r) => r.id).join(", ") || "none"})`);

console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${publicResources.length} student-visible resources, ${hiddenCount} Directed Writing items hidden.`);
if (failures > 0) {
  console.error(`${failures} assertion(s) failed.`);
  process.exit(1);
}
