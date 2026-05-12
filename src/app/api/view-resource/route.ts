import { readFile, stat } from "fs/promises";
import { basename, extname, relative, resolve } from "path";
import type { NextRequest } from "next/server";
import { getPublicResources } from "@/lib/public-cms";

export const dynamic = "force-dynamic";

const SUPABASE_RESOURCE_BUCKET =
  process.env.SUPABASE_RESOURCE_BUCKET || process.env.SUPABASE_BUCKET_NAME || "resources";
const SIGNED_URL_TTL_SECONDS = 60 * 5;
/** Signed URLs remain valid for 300s; cache slightly shorter so Range-heavy PDF viewers reuse one signature. */
const SIGNED_URL_CACHE_MS = (SIGNED_URL_TTL_SECONDS - 90) * 1000;
const IS_DEV = process.env.NODE_ENV !== "production";

type CachedSignedUrl = { url: string; expiresAtMs: number };
const signedUrlCache = new Map<string, CachedSignedUrl>();
const signedUrlInflight = new Map<string, Promise<string | null>>();

function contentTypeFor(pathname: string, fallback = "application/octet-stream") {
  switch (extname(pathname).toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".csv":
      return "text/csv; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return fallback;
  }
}

function inlineHeaders(pathname: string, contentType: string, browserCache: "none" | "short-private" = "short-private") {
  const filename = basename(pathname).replace(/["\r\n]/g, "");
  const cacheControl =
    browserCache === "short-private"
      ? "private, max-age=120"
      : "private, no-store";
  return {
    "Content-Type": contentType,
    "Content-Disposition": `inline${filename ? `; filename="${filename}"` : ""}`,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  };
}

function jsonError(message: string, status: number, details?: Record<string, string | number | boolean | undefined>) {
  if (IS_DEV) {
    return Response.json({ error: message, ...details }, { status });
  }
  return Response.json({ error: message }, { status });
}

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
}

function encodeStoragePath(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function decodeStoragePath(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    })
    .join("/");
}

function parseSupabaseResourceUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    if (url.protocol !== "https:") return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/);
    if (!match) return null;
    const [, bucket, rawPath] = match;
    if (bucket !== SUPABASE_RESOURCE_BUCKET || !rawPath) return null;
    return { url, bucket, path: decodeStoragePath(rawPath), publicUrl: fileUrl };
  } catch {
    return null;
  }
}

function resourceMatchesLocator(resource: { id: string; fileUrl?: string }, locator: string) {
  if (resource.id === locator || resource.fileUrl === locator) return true;
  if (!resource.fileUrl) return false;
  const normalized = locator.replace(/^\/+/, "");
  const parsed = parseSupabaseResourceUrl(resource.fileUrl);
  if (parsed && (parsed.path === normalized || `${parsed.bucket}/${parsed.path}` === normalized)) return true;
  const localPath = resource.fileUrl.startsWith("/") ? resource.fileUrl.slice(1) : resource.fileUrl;
  return localPath === normalized;
}

function supabaseUrlForBucketPath(locator: string) {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;
  const normalized = locator.replace(/^\/+/, "");
  const withoutBucket = normalized.startsWith(`${SUPABASE_RESOURCE_BUCKET}/`)
    ? normalized.slice(SUPABASE_RESOURCE_BUCKET.length + 1)
    : normalized;
  return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_RESOURCE_BUCKET}/${encodeStoragePath(
    decodeStoragePath(withoutBucket)
  )}`;
}

function toAbsoluteSignedUrl(supabaseUrl: string, signedPath: string) {
  if (signedPath.startsWith("http")) return signedPath;
  const normalized = signedPath.startsWith("/") ? signedPath : `/${signedPath}`;
  if (normalized.startsWith("/storage/v1/")) return `${supabaseUrl}${normalized}`;
  return `${supabaseUrl}/storage/v1${normalized}`;
}

async function createSignedSupabaseUrl(parsed: NonNullable<ReturnType<typeof parseSupabaseResourceUrl>>) {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const signUrl = `${supabaseUrl}/storage/v1/object/sign/${parsed.bucket}/${encodeStoragePath(parsed.path)}`;
  const response = await fetch(signUrl, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[view-resource] Supabase sign failed", {
      status: response.status,
      bucket: parsed.bucket,
      path: parsed.path,
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceKey: Boolean(serviceKey),
      body: body.slice(0, 200),
    });
    return null;
  }

  const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL || payload.signedUrl;
  if (!signedPath) return null;
  return toAbsoluteSignedUrl(supabaseUrl, signedPath);
}

async function getOrCreateSignedSupabaseUrl(parsed: NonNullable<ReturnType<typeof parseSupabaseResourceUrl>>) {
  const key = `${parsed.bucket}:${parsed.path}`;
  const now = Date.now();
  const hit = signedUrlCache.get(key);
  if (hit && hit.expiresAtMs > now + 15_000) {
    return hit.url;
  }

  let inflight = signedUrlInflight.get(key);
  if (!inflight) {
    inflight = (async () => {
      const url = await createSignedSupabaseUrl(parsed);
      if (url) {
        signedUrlCache.set(key, { url, expiresAtMs: Date.now() + SIGNED_URL_CACHE_MS });
      }
      return url;
    })().finally(() => {
      signedUrlInflight.delete(key);
    });
    signedUrlInflight.set(key, inflight);
  }

  return inflight;
}

function cloneUpstreamHeaders(fileUrl: string, upstream: Response) {
  const contentType = contentTypeFor(fileUrl, upstream.headers.get("Content-Type") || undefined);
  const headers = new Headers(inlineHeaders(fileUrl, contentType));
  for (const key of ["Content-Length", "Content-Range", "Accept-Ranges", "Last-Modified", "ETag"]) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  return headers;
}

async function streamRemoteResource(fileUrl: string, req: NextRequest) {
  const parsed = parseSupabaseResourceUrl(fileUrl);
  if (!parsed) {
    console.error("[view-resource] Unsupported remote resource URL", { fileUrl });
    return jsonError("Resource URL is not a supported Supabase Storage URL.", 404, { fileUrl });
  }

  // Public bucket objects (/object/public/…) are served directly — no signing needed.
  const isPublicBucketUrl = parsed.url.pathname.includes("/object/public/");

  let viewUrl: string;
  if (isPublicBucketUrl) {
    // Reconstruct the canonical public URL from the env-var Supabase origin so the request
    // always targets the live project even if fileUrl has a stale hostname.
    // Object path inside the bucket is everything after /object/public/<bucket>/
    // e.g. "vocabulary/final-p1-vocabulary-list.pdf" — no bucket prefix, no storage prefix.
    const supabaseOrigin = getSupabaseUrl();
    viewUrl = supabaseOrigin
      ? `${supabaseOrigin}/storage/v1/object/public/${parsed.bucket}/${encodeStoragePath(parsed.path)}`
      : parsed.publicUrl;
  } else {
    // Private / authenticated objects require a signed URL.
    const hasPrivateEnv = Boolean(getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const signedUrl = hasPrivateEnv ? await getOrCreateSignedSupabaseUrl(parsed) : null;
    // Fail fast — don't proceed to a fetch that will also fail without a valid signed URL.
    if (hasPrivateEnv && !signedUrl) {
      return jsonError("Could not create a signed Supabase resource URL.", 500, {
        bucket: parsed.bucket,
        path: parsed.path,
      });
    }
    viewUrl = signedUrl ?? parsed.publicUrl;
  }

  const upstream = await fetch(viewUrl, {
    cache: "no-store",
    headers: req.headers.get("range") ? { Range: req.headers.get("range") as string } : undefined,
  });

  if (!upstream.ok || !upstream.body) {
    const supabaseEnvUrl = getSupabaseUrl();
    console.error("[view-resource] public fetch failed", {
      originalFileUrl: fileUrl,
      supabaseUrl: supabaseEnvUrl || "(not set)",
      objectPath: parsed.path,
      reconstructedUrl: viewUrl,
      fetchStatus: upstream.status,
      fetchStatusText: upstream.statusText,
      bucket: parsed.bucket,
      isPublicBucketUrl,
    });
    if (IS_DEV) {
      return Response.json(
        {
          error: "Resource file was not found in Supabase Storage.",
          debug: {
            originalFileUrl: fileUrl,
            supabaseUrl: supabaseEnvUrl || "(not set — check SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL env var)",
            objectPath: parsed.path,
            reconstructedUrl: viewUrl,
            fetchStatus: upstream.status,
            fetchStatusText: upstream.statusText,
            bucket: parsed.bucket,
            hint: "Open reconstructedUrl directly in a browser to verify the file exists and the bucket is public.",
          },
        },
        { status: 404 }
      );
    }
    return jsonError("Resource file was not found in Supabase Storage.", 404, {
      bucket: parsed.bucket,
      path: parsed.path,
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: cloneUpstreamHeaders(fileUrl, upstream),
  });
}

function parseRange(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null;
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  const [, startRaw, endRaw] = match;
  let start = startRaw ? Number(startRaw) : 0;
  let end = endRaw ? Number(endRaw) : size - 1;
  if (!startRaw && endRaw) {
    const suffixLength = Number(endRaw);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start < 0 || end >= size) {
    return null;
  }
  return { start, end };
}

async function streamLocalResource(fileUrl: string, req: NextRequest) {
  if (!fileUrl.startsWith("/resources/")) {
    return jsonError("Resource path is not viewable.", 404, { fileUrl });
  }

  const publicRoot = resolve(process.cwd(), "public");
  const pathOnly = fileUrl.split("?")[0]?.split("#")[0] ?? fileUrl;
  const rel = pathOnly.replace(/^\/+/, "");
  const filePath = resolve(publicRoot, rel);
  const relCheck = relative(publicRoot, filePath);
  if (relCheck.startsWith("..") || relCheck.startsWith("/") || relCheck === "") {
    return jsonError("Resource path is invalid.", 404, { fileUrl });
  }

  const fileInfo = await stat(filePath).catch(() => null);
  if (!fileInfo?.isFile()) {
    console.error("[view-resource] Local resource missing", { fileUrl, filePath });
    return jsonError("Local resource file was not found.", 404, { fileUrl });
  }

  const contentType = contentTypeFor(filePath);
  const range = parseRange(req.headers.get("range"), fileInfo.size);
  if (range) {
    const fileBuffer = await readFile(filePath);
    const chunk = fileBuffer.subarray(range.start, range.end + 1);
    const headers = new Headers(inlineHeaders(filePath, contentType, "short-private"));
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", String(chunk.length));
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${fileInfo.size}`);
    return new Response(chunk, { status: 206, headers });
  }

  const fileBuffer = await readFile(filePath);
  const headers = new Headers(inlineHeaders(filePath, contentType, "short-private"));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(fileInfo.size));
  return new Response(fileBuffer, { headers });
}

export async function GET(req: NextRequest) {
  try {
    const locator =
      req.nextUrl.searchParams.get("id") ||
      req.nextUrl.searchParams.get("path") ||
      req.nextUrl.searchParams.get("url");
    if (!locator) {
      return jsonError("Missing resource identifier.", 400);
    }

    const resources = await getPublicResources();
    const resource = resources.find((r) => resourceMatchesLocator(r, locator));
    const fileUrl =
      resource?.type === "mcq"
        ? ""
        : resource?.fileUrl ||
          (locator.startsWith("http") || locator.startsWith("/resources/")
            ? locator
            : supabaseUrlForBucketPath(locator));

    if (!fileUrl) {
      console.error("[view-resource] Resource metadata not found", { locator });
      return jsonError("Resource metadata was not found.", 404, { locator });
    }

    if (fileUrl.startsWith("http")) {
      return streamRemoteResource(fileUrl, req);
    }

    return streamLocalResource(fileUrl, req);
  } catch (e) {
    console.error("view-resource error:", e);
    return jsonError("Resource viewer server error.", 500);
  }
}
