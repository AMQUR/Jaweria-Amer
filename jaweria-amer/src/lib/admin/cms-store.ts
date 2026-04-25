import "server-only";

import { mkdir, readFile, readdir, rm, stat, unlink, writeFile } from "fs/promises";
import { basename, extname, join, relative } from "path";
import { staticResources } from "@/lib/data";
import { defaultHomepageContent } from "./defaults";
import { mcqSets as staticMcqSets } from "@/lib/mcq-data";
import type { Resource, ResourceNotesSubCategory } from "@/lib/data";
import type { McqSet, McqQuestion } from "@/lib/mcq-data";
import { basenameFromFileUrl, cleanCopyOfTitlePrefix } from "@/lib/resource-ingestion";
import type { CmsMcqSet, CmsResourceCategory, CmsResourceRecord, HomepageContent, UploadAsset } from "./cms-types";

const DATA_DIR = join(process.cwd(), "data");
const PUBLIC_DIR = join(process.cwd(), "public");
const RESOURCE_ROOT = join(PUBLIC_DIR, "resources");
const STATIC_RECORD_TIMESTAMP = "2024-01-01T00:00:00.000Z";

const RESOURCE_RECORDS_FILE = "cms-resources.json";
const MCQ_RECORDS_FILE = "cms-mcqs.json";
const HOMEPAGE_FILE = "cms-homepage.json";

const CATEGORY_TO_FOLDER: Record<CmsResourceCategory, string> = {
  "general-notes": "notes",
  topicals: "topicals",
  "yearly-past-papers": "yearlies",
  "examiner-reports": "scripts",
  checklists: "marking-schemes",
  "quick-worksheets": "mcq",
  vocabulary: "vocabulary",
  "solved-papers": "notes/solved-papers",
  featured: "featured",
};

function nowIso() {
  return new Date().toISOString();
}

async function ensureDir(pathname: string) {
  await mkdir(pathname, { recursive: true });
}

async function readJSON<T>(filename: string, fallback: T): Promise<T> {
  await ensureDir(DATA_DIR);
  try {
    const raw = await readFile(join(DATA_DIR, filename), "utf-8");
    const parsed: unknown = JSON.parse(raw) as unknown;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    if (
      fallback !== null &&
      typeof fallback === "object" &&
      !Array.isArray(fallback) &&
      (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
    ) {
      return fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(filename: string, value: T): Promise<void> {
  await ensureDir(DATA_DIR);
  await writeFile(join(DATA_DIR, filename), JSON.stringify(value, null, 2), "utf-8");
}

function slugify(value: string) {
  return cleanCopyOfTitlePrefix(value)
    .toLowerCase()
    .replace(/copy of\s+/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function titleFromFileName(fileName: string) {
  const clean = cleanCopyOfTitlePrefix(fileName.replace(/\.[^.]+$/, ""));
  return clean
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferNotesSubCategory(raw: string): ResourceNotesSubCategory | undefined {
  if (raw.includes("summary")) return "summary-writing";
  if (raw.includes("comprehension")) return "comprehension";
  if (raw.includes("essay") || raw.includes("descriptive") || raw.includes("narrative")) return "essay-writing";
  if (raw.includes("directed")) return "directed-writing";
  if (raw.includes("grammar") || raw.includes("sentence") || raw.includes("punctuation")) return "grammar";
  if (raw.includes("solved-papers") || raw.includes("solved paper")) return "solved-papers";
  return undefined;
}

function inferPaperAndSection(rawInput: string): { paper: string; section?: string } {
  const raw = rawInput.toLowerCase();
  let paper = "";
  let section: string | undefined;

  if (raw.includes("paper 1") || raw.includes("p1") || raw.includes("writing")) {
    paper = "Paper 1";
  } else if (raw.includes("paper 2") || raw.includes("p2") || raw.includes("reading")) {
    paper = "Paper 2";
  }

  if (paper === "Paper 1") {
    if (raw.includes("directed")) section = "Directed Writing";
    else if (raw.includes("essay") || raw.includes("composition") || raw.includes("narrative") || raw.includes("descriptive")) section = "Composition";
    else section = "General Writing";
  } else if (paper === "Paper 2") {
    if (raw.includes("comprehension") || raw.includes("question 1") || raw.includes("q1")) section = "Comprehension";
    else if (raw.includes("language") || raw.includes("use of language") || raw.includes("q2")) section = "Language";
    else if (raw.includes("summary") || raw.includes("q3")) section = "Summary";
    else section = "General Reading";
  } else {
    if (raw.includes("paper 1") || raw.includes("q1") || raw.includes("question 1")) section = "Question 1";
    else if (raw.includes("paper 2") || raw.includes("q2") || raw.includes("question 2")) section = "Question 2";
    else if (raw.includes("q3") || raw.includes("question 3")) section = "Question 3";
  }

  return { paper, section };
}

function inferResourceShape(input: {
  title: string;
  fileName?: string;
  category: CmsResourceCategory;
  subCategory?: ResourceNotesSubCategory;
  paper?: string;
  section?: string;
  autoDetectSection?: boolean;
}) {
  const raw = `${input.title} ${input.fileName ?? ""}`.trim();
  const inferredPaperSection = input.autoDetectSection ? inferPaperAndSection(raw) : { paper: input.paper ?? "", section: input.section };
  const subCategory =
    input.category === "general-notes"
      ? input.subCategory ?? inferNotesSubCategory(raw)
      : undefined;

  return {
    paper: input.paper || inferredPaperSection.paper || (input.category === "quick-worksheets" ? "Grammar" : ""),
    section: input.section || inferredPaperSection.section,
    subCategory,
  };
}

function toCmsResource(resource: Resource): CmsResourceRecord {
  return {
    id: resource.id,
    title: resource.title,
    category: resource.category,
    subCategory: resource.subCategory,
    paper: resource.paper,
    section: resource.section,
    fileUrl: resource.fileUrl,
    type: resource.type === "mcq" ? "mcq" : "pdf",
    visibility: "published",
    createdAt: STATIC_RECORD_TIMESTAMP,
    updatedAt: STATIC_RECORD_TIMESTAMP,
    fileName: basenameFromFileUrl(resource.fileUrl || `${resource.id}.pdf`) || `${resource.id}.pdf`,
    subject: resource.subject,
    level: resource.level,
    year: resource.year,
    description: resource.description,
    source: "static",
  };
}

function toResource(record: CmsResourceRecord): Resource {
  return {
    id: record.id,
    title: record.title,
    category: record.category,
    subCategory: record.subCategory,
    paper: record.paper,
    section: record.section,
    fileUrl: record.fileUrl,
    type: record.type === "mcq" ? "mcq" : undefined,
    subject: record.subject,
    level: record.level,
    year: record.year,
    description: record.description,
  };
}

function defaultMcqMeta(id: string): Omit<CmsMcqSet, "questions" | "createdAt" | "updatedAt"> {
  const staticResource = staticResources.find((resource) => resource.id === id);
  return {
    id,
    title: staticResource?.title ?? titleFromFileName(id),
    description: staticResource?.description ?? "",
    timeLimit: staticMcqSets[id]?.timeLimit,
    visibility: "published",
    paper: staticResource?.paper ?? "Grammar",
    section: staticResource?.section,
    subject: staticResource?.subject ?? "English Language 1123",
    level: staticResource?.level ?? "O Level",
    year: staticResource?.year ?? "Practice",
    source: "static",
  };
}

type SaveFileError = { error: string };

async function saveFileToPublic(
  file: File,
  category: CmsResourceCategory,
  title: string
): Promise<string | SaveFileError> {
  const fileExt = extname(file.name).toLowerCase();
  if (fileExt !== ".pdf") {
    return { error: "Only PDF files are allowed." };
  }
  const folder = CATEGORY_TO_FOLDER[category];
  const targetDir = join(RESOURCE_ROOT, folder);
  await ensureDir(targetDir);
  const targetName = `${slugify(title || file.name) || `resource-${Date.now()}`}.pdf`;
  const targetPath = join(targetDir, targetName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);
  return `/resources/${folder}/${targetName}`;
}

async function replaceHomepageBanner(file: File): Promise<string | SaveFileError> {
  const ext = extname(file.name).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    return { error: "Upload a PNG, JPG, JPEG, or WEBP image." };
  }
  const imageDir = join(PUBLIC_DIR, "images");
  await ensureDir(imageDir);
  for (const variant of [".png", ".jpg", ".jpeg", ".webp"]) {
    await rm(join(imageDir, `homepage-banner${variant}`), { force: true });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(imageDir, `homepage-banner${ext}`), buffer);
  return `/images/homepage-banner${ext}`;
}

async function deletePublicFile(fileUrl: string | undefined) {
  if (!fileUrl?.startsWith("/resources/")) return;
  const target = join(PUBLIC_DIR, fileUrl.replace(/^\//, ""));
  try {
    await unlink(target);
  } catch {}
}

export async function getStoredResourceOverrides() {
  return readJSON<CmsResourceRecord[]>(RESOURCE_RECORDS_FILE, []);
}

export async function getStoredMcqOverrides() {
  return readJSON<CmsMcqSet[]>(MCQ_RECORDS_FILE, []);
}

export async function getHomepageContent() {
  try {
    const stored = await readJSON<Partial<HomepageContent>>(HOMEPAGE_FILE, {});
    return {
      ...defaultHomepageContent,
      ...stored,
      updatedAt: stored?.updatedAt ?? defaultHomepageContent.updatedAt,
    } satisfies HomepageContent;
  } catch {
    return { ...defaultHomepageContent };
  }
}

export async function saveHomepageContent(
  input: Omit<HomepageContent, "updatedAt" | "bannerImagePath"> & { bannerFile?: File | null }
): Promise<HomepageContent | { error: string }> {
  const current = await getHomepageContent();
  let bannerImagePath = current.bannerImagePath;
  if (input.bannerFile && input.bannerFile.size > 0) {
    const nextBanner = await replaceHomepageBanner(input.bannerFile);
    if (typeof nextBanner === "object" && "error" in nextBanner) {
      return nextBanner;
    }
    bannerImagePath = nextBanner;
  }

  const next: HomepageContent = {
    ...current,
    ...input,
    bannerImagePath,
    updatedAt: nowIso(),
  };

  try {
    await writeJSON(HOMEPAGE_FILE, next);
  } catch {
    return { error: "Could not save homepage content." };
  }
  return next;
}

export async function getCmsMcqSets(): Promise<CmsMcqSet[]> {
  try {
    const overrides = await getStoredMcqOverrides();
    const map = new Map<string, CmsMcqSet>();
    const timestamp = STATIC_RECORD_TIMESTAMP;

    for (const [id, mcq] of Object.entries(staticMcqSets ?? {})) {
      const base = defaultMcqMeta(id);
      const questions = mcq?.questions ?? [];
      map.set(id, {
        ...base,
        questions,
        createdAt: timestamp,
        updatedAt: timestamp,
        timeLimit: mcq?.timeLimit,
      });
    }

    for (const override of overrides ?? []) {
      const existing = map.get(override.id);
      map.set(override.id, {
        ...(existing ?? override),
        ...override,
        source: existing ? "static" : override.source ?? "admin",
        createdAt: existing?.createdAt ?? override.createdAt ?? timestamp,
        updatedAt: override.updatedAt ?? timestamp,
      });
    }

    return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function saveCmsMcqSet(input: {
  id?: string;
  title: string;
  description: string;
  timeLimit?: number;
  questions: McqQuestion[];
  visibility: "published" | "draft";
  paper: string;
  section?: string;
  subject: string;
  level: string;
  year: string;
}): Promise<CmsMcqSet | { error: string }> {
  const overrides = await getStoredMcqOverrides();
  const all = await getCmsMcqSets();
  const existing = input.id ? all.find((item) => item.id === input.id) : undefined;
  const generatedId = input.id || `mcq-${slugify(input.title) || Date.now().toString()}`;
  const now = nowIso();

  if (!existing && all.some((item) => item.id === generatedId)) {
    return { error: "An MCQ with this ID already exists." };
  }

  const record: CmsMcqSet = {
    id: generatedId,
    title: input.title,
    description: input.description,
    timeLimit: input.timeLimit,
    questions: input.questions ?? [],
    visibility: input.visibility,
    paper: input.paper,
    section: input.section,
    subject: input.subject,
    level: input.level,
    year: input.year,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    source: existing?.source ?? "admin",
  };

  const next = overrides.filter((item) => item.id !== generatedId);
  next.push(record);
  try {
    await writeJSON(MCQ_RECORDS_FILE, next);
  } catch {
    return { error: "Could not save MCQ set." };
  }
  return record;
}

export async function deleteCmsMcqSet(id: string) {
  const all = await getCmsMcqSets();
  const current = all.find((item) => item.id === id);
  if (!current) return;
  const overrides = await getStoredMcqOverrides();

  if (current.source === "static") {
    const next = overrides.filter((item) => item.id !== id);
    next.push({ ...current, deleted: true, updatedAt: nowIso() });
    await writeJSON(MCQ_RECORDS_FILE, next);
    return;
  }

  await writeJSON(MCQ_RECORDS_FILE, overrides.filter((item) => item.id !== id));
}

export async function getPublicMcqSets(): Promise<Record<string, McqSet>> {
  const merged = await getCmsMcqSets();
  const published = merged.filter((item) => !item.deleted && item.visibility === "published");
  const fromCms = Object.fromEntries(
    published.map((item) => {
      const staticBase = staticMcqSets[item.id];
      const questions =
        Array.isArray(item.questions) && item.questions.length > 0
          ? item.questions
          : (staticBase?.questions ?? []);
      return [
        item.id,
        {
          id: item.id,
          title: item.title,
          description: item.description,
          timeLimit: item.timeLimit ?? staticBase?.timeLimit,
          questions,
        } satisfies McqSet,
      ];
    })
  );
  return { ...staticMcqSets, ...fromCms };
}

export async function getCmsResources(): Promise<CmsResourceRecord[]> {
  try {
    return await getCmsResourcesInternal();
  } catch {
    return [];
  }
}

async function getCmsResourcesInternal(): Promise<CmsResourceRecord[]> {
  const overrides = await getStoredResourceOverrides();
  const map = new Map<string, CmsResourceRecord>();

  for (const resource of staticResources ?? []) {
    map.set(resource.id, toCmsResource(resource));
  }

  for (const override of overrides ?? []) {
    const existing = map.get(override.id);
    map.set(override.id, {
      ...(existing ?? override),
      ...override,
      source: existing ? existing.source : override.source ?? "admin",
      createdAt: existing?.createdAt ?? override.createdAt ?? nowIso(),
      updatedAt: override.updatedAt ?? nowIso(),
    });
  }

  const mcqs = await getCmsMcqSets();
  for (const mcq of mcqs) {
    const existing = map.get(mcq.id);
    const record: CmsResourceRecord = {
      id: mcq.id,
      title: mcq.title,
      category: "quick-worksheets",
      paper: mcq.paper,
      section: mcq.section,
      fileUrl: "",
      type: "mcq",
      visibility: mcq.visibility,
      createdAt: existing?.createdAt ?? mcq.createdAt,
      updatedAt: mcq.updatedAt,
      fileName: `${mcq.id}.json`,
      subject: mcq.subject,
      level: mcq.level,
      year: mcq.year,
      description: mcq.description,
      source: mcq.source,
      deleted: mcq.deleted,
    };
    map.set(mcq.id, { ...(existing ?? record), ...record });
  }

  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveCmsResource(input: {
  id?: string;
  title: string;
  category: CmsResourceCategory;
  subCategory?: ResourceNotesSubCategory;
  paper?: string;
  section?: string;
  visibility: "published" | "draft";
  subject: string;
  level: string;
  year: string;
  description: string;
  autoDetectSection?: boolean;
  file?: File | null;
}): Promise<CmsResourceRecord | { error: string }> {
  const merged = await getCmsResources();
  const current = input.id ? merged.find((item) => item.id === input.id) : undefined;
  if (current?.type === "mcq") {
    return { error: "Quick Worksheets are managed from the MCQ builder." };
  }

  const effectiveId = input.id || `resource-${slugify(input.title) || Date.now().toString()}`;
  if (!current && merged.some((item) => item.id === effectiveId)) {
    return { error: "A resource with this ID already exists." };
  }

  const fileName = input.file?.name ?? current?.fileName ?? `${slugify(input.title) || effectiveId}.pdf`;
  const inferred = inferResourceShape({
    title: input.title,
    fileName,
    category: input.category,
    subCategory: input.subCategory,
    paper: input.paper,
    section: input.section,
    autoDetectSection: input.autoDetectSection,
  });

  let fileUrl = current?.fileUrl ?? "";
  if (input.file && input.file.size > 0) {
    const uploaded = await saveFileToPublic(input.file, input.category, input.title);
    if (typeof uploaded === "object" && "error" in uploaded) {
      return uploaded;
    }
    fileUrl = uploaded;
    if (current?.source === "admin" && current.fileUrl && current.fileUrl !== fileUrl) {
      await deletePublicFile(current.fileUrl);
    }
  } else if (!fileUrl) {
    return { error: "Upload a PDF file." };
  }

  const nextRecord: CmsResourceRecord = {
    id: effectiveId,
    title: input.title,
    category: input.category,
    subCategory: inferred.subCategory,
    paper: inferred.paper || current?.paper || "",
    section: inferred.section,
    fileUrl,
    type: "pdf",
    visibility: input.visibility,
    createdAt: current?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
    fileName,
    subject: input.subject,
    level: input.level,
    year: input.year,
    description: input.description,
    source: current?.source ?? "admin",
    autoDetectSection: Boolean(input.autoDetectSection),
  };

  const overrides = await getStoredResourceOverrides();
  const nextOverrides = (overrides ?? []).filter((item) => item.id !== effectiveId);
  nextOverrides.push(nextRecord);
  try {
    await writeJSON(RESOURCE_RECORDS_FILE, nextOverrides);
  } catch {
    return { error: "Could not save resource." };
  }
  return nextRecord;
}

export async function deleteCmsResource(id: string) {
  const merged = await getCmsResources();
  const current = merged.find((item) => item.id === id);
  if (!current) return;
  if (current.type === "mcq") {
    await deleteCmsMcqSet(id);
    return;
  }

  const overrides = await getStoredResourceOverrides();
  if (current.source === "static") {
    const next = overrides.filter((item) => item.id !== id);
    next.push({ ...current, deleted: true, visibility: "draft", updatedAt: nowIso() });
    await writeJSON(RESOURCE_RECORDS_FILE, next);
    await deletePublicFile(current.fileUrl);
    return;
  }

  await deletePublicFile(current.fileUrl);
  await writeJSON(RESOURCE_RECORDS_FILE, overrides.filter((item) => item.id !== id));
}

export async function getPublicResources(): Promise<Resource[]> {
  const merged = await getCmsResources();
  return merged
    .filter((item) => !item.deleted && item.visibility === "published")
    .filter((item) => item.type === "mcq" || item.fileUrl)
    .map(toResource);
}

async function walkFiles(dir: string): Promise<string[]> {
  let entries: string[] = [];
  try {
    const nodes = await readdir(dir, { withFileTypes: true });
    for (const node of nodes) {
      const full = join(dir, node.name);
      if (node.isDirectory()) {
        entries = entries.concat(await walkFiles(full));
      } else {
        entries.push(full);
      }
    }
  } catch {}
  return entries;
}

export async function getUploadAssets(): Promise<UploadAsset[]> {
  try {
    const files = await walkFiles(RESOURCE_ROOT);
    const assets: UploadAsset[] = [];

    for (const filePath of files) {
      try {
        const info = await stat(filePath);
        const rel = relative(PUBLIC_DIR, filePath).replace(/\\/g, "/");
        assets.push({
          path: filePath,
          url: `/${rel}`,
          fileName: basename(filePath),
          size: info.size,
          updatedAt: info.mtime.toISOString(),
          category: rel.split("/")[1] ?? "resources",
        });
      } catch {}
    }

    try {
      for (const variant of [".png", ".jpg", ".jpeg", ".webp"]) {
        const bannerPath = join(PUBLIC_DIR, "images", `homepage-banner${variant}`);
        try {
          const banner = await stat(bannerPath);
          assets.unshift({
            path: bannerPath,
            url: `/images/homepage-banner${variant}`,
            fileName: `homepage-banner${variant}`,
            size: banner.size,
            updatedAt: banner.mtime.toISOString(),
            category: "images",
          });
          break;
        } catch {}
      }
    } catch {}

    return assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function deleteUploadAsset(url: string) {
  if (!url.startsWith("/resources/")) return;
  const target = join(PUBLIC_DIR, url.replace(/^\//, ""));
  await rm(target, { force: true });
}
