import "server-only";

import type { UploadAsset } from "./cms-types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = process.env.SUPABASE_BUCKET_NAME ?? "resources";

// JSON metadata is stored inside the bucket under this prefix (not PDF-served, just data)
const META_PREFIX = "_meta";

// ── Helpers ───────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${SERVICE_ROLE_KEY}` };
}

function objectUrl(bucketPath: string): string {
  // Encode each path segment separately to preserve slashes
  const encoded = bucketPath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encoded}`;
}

export function publicUrlForPath(bucketPath: string): string {
  const encoded = bucketPath
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

/** Extract bucket path from a Supabase public URL, or null if URL is unrelated. */
export function bucketPathFromUrl(url: string): string | null {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length));
}

/** Convert a category folder name to a Supabase bucket path prefix. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bucketPathForUpload(folder: string, title: string): string {
  const name = `${slugify(title) || `resource-${Date.now()}`}.pdf`;
  return folder ? `${folder}/${name}` : name;
}

// ── PDF Upload ─────────────────────────────────────────────────────────────────

export async function uploadPdf(
  file: File,
  bucketPath: string
): Promise<{ url: string } | { error: string }> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are allowed." };
  }
  if (file.size > 25 * 1024 * 1024) {
    return { error: "File exceeds the 25 MB limit." };
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { error: "Supabase is not configured (missing env vars)." };
  }

  const buffer = await file.arrayBuffer();
  const res = await fetch(objectUrl(bucketPath), {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!res.ok) {
    const body = await res.text();
    return { error: `Upload failed (${res.status}): ${body}` };
  }

  return { url: publicUrlForPath(bucketPath) };
}

// ── Delete ────────────────────────────────────────────────────────────────────

/** Delete one or more objects from the bucket. Swallows errors silently. */
export async function deleteSupabasePaths(bucketPaths: string[]): Promise<void> {
  if (!bucketPaths.length || !SUPABASE_URL || !SERVICE_ROLE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: bucketPaths }),
    });
  } catch {
    // Best-effort — do not throw on delete failure
  }
}

/** Delete a single path derived from a public URL. No-op if URL is not Supabase. */
export async function deleteByPublicUrl(url: string | undefined): Promise<void> {
  if (!url) return;
  const path = bucketPathFromUrl(url);
  if (path) await deleteSupabasePaths([path]);
}

// ── Metadata JSON (small admin state files stored in bucket under _meta/) ─────

export async function readMetaJson<T>(filename: string, fallback: T): Promise<T> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return fallback;
  try {
    const res = await fetch(objectUrl(`${META_PREFIX}/${filename}`), {
      headers: authHeaders(),
      // Bypass Next.js cache — we always want the freshest admin state
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const text = await res.text();
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
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

export async function writeMetaJson<T>(filename: string, value: T): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured — cannot persist admin data.");
  }
  const body = JSON.stringify(value, null, 2);
  const res = await fetch(objectUrl(`${META_PREFIX}/${filename}`), {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
      "x-upsert": "true",
    },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`writeMetaJson(${filename}) failed: ${err}`);
  }
}

// ── List bucket objects (for uploads page) ────────────────────────────────────

interface SupabaseListItem {
  id: string | null;
  name: string;
  updated_at: string;
  created_at: string;
  metadata: { size: number; mimetype: string } | null;
}

async function listPrefix(prefix: string): Promise<SupabaseListItem[]> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        prefix,
        limit: 500,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      }),
    });
    if (!res.ok) return [];
    const items = (await res.json()) as SupabaseListItem[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** Recursively list all PDF objects in the bucket (skipping _meta/). */
export async function listSupabasePdfs(): Promise<UploadAsset[]> {
  // Folders known to contain PDFs; "" covers root-level files
  const KNOWN_PREFIXES = [
    "",
    "examiner-reports/",
    "notes/",
    "notes/solved-papers/",
    "notes/vocabulary/",
    "notes/directed-writing/",
    "scripts/",
    "topicals/paper-1/comprehension/ms/",
    "topicals/paper-1/comprehension/qp/",
    "topicals/paper-1/summary/ms/",
    "topicals/paper-1/summary/qp/",
    "topicals/paper-2/directed-writing/",
    "topicals/paper-2/essay/",
    "vocabulary/",
    "yearlies/",
    "marking-schemes/",
    "featured/",
  ];

  const seen = new Set<string>();
  const assets: UploadAsset[] = [];

  for (const prefix of KNOWN_PREFIXES) {
    const items = await listPrefix(prefix);
    for (const item of items) {
      if (!item.id || !item.name.endsWith(".pdf")) continue;
      const fullPath = prefix + item.name;
      if (seen.has(fullPath)) continue;
      seen.add(fullPath);
      assets.push({
        path: fullPath,
        url: publicUrlForPath(fullPath),
        fileName: item.name,
        size: item.metadata?.size ?? 0,
        updatedAt: item.updated_at,
        category: prefix ? prefix.split("/")[0] : "resources",
      });
    }
  }

  return assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
