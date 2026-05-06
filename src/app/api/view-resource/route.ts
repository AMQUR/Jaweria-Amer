import { readFile } from "fs/promises";
import { basename, extname, relative, resolve } from "path";
import type { NextRequest } from "next/server";
import { getPublicResources } from "@/lib/public-cms";

export const dynamic = "force-dynamic";

const SUPABASE_RESOURCE_BUCKET = process.env.SUPABASE_RESOURCE_BUCKET || "resources";
const SIGNED_URL_TTL_SECONDS = 60 * 5;

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

function inlineHeaders(pathname: string, contentType: string) {
  const filename = basename(pathname).replace(/["\r\n]/g, "");
  return {
    "Content-Type": contentType,
    "Content-Disposition": `inline${filename ? `; filename="${filename}"` : ""}`,
    "Cache-Control": "no-store, private",
    "X-Content-Type-Options": "nosniff",
  };
}

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
}

function parseSupabaseResourceUrl(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    if (url.protocol !== "https:") return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
    if (!match) return null;
    const [, bucket, rawPath] = match;
    if (bucket !== SUPABASE_RESOURCE_BUCKET || !rawPath) return null;
    return { url, bucket, path: decodeURIComponent(rawPath) };
  } catch {
    return null;
  }
}

async function createSignedSupabaseUrl(fileUrl: string) {
  const parsed = parseSupabaseResourceUrl(fileUrl);
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!parsed || !supabaseUrl || !serviceKey) return fileUrl;

  const signUrl = `${supabaseUrl}/storage/v1/object/sign/${parsed.bucket}/${encodeURI(parsed.path)}`;
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
  if (!response.ok) return fileUrl;

  const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL || payload.signedUrl;
  if (!signedPath) return fileUrl;
  return signedPath.startsWith("http") ? signedPath : `${supabaseUrl}${signedPath}`;
}

async function streamRemoteResource(fileUrl: string) {
  if (!parseSupabaseResourceUrl(fileUrl)) {
    return new Response("Not found", { status: 404 });
  }

  const viewUrl = await createSignedSupabaseUrl(fileUrl);
  const upstream = await fetch(viewUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status || 404 });
  }

  const contentType = contentTypeFor(fileUrl, upstream.headers.get("Content-Type") || undefined);
  return new Response(upstream.body, {
    status: 200,
    headers: inlineHeaders(fileUrl, contentType),
  });
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    const resources = await getPublicResources();
    const resource = resources.find((r) => r.id === id);

    if (!resource || resource.type === "mcq" || !resource.fileUrl) {
      return new Response("Not found", { status: 404 });
    }

    if (resource.fileUrl.startsWith("http")) {
      return streamRemoteResource(resource.fileUrl);
    }

    if (!resource.fileUrl.startsWith("/resources/")) {
      return new Response("Not found", { status: 404 });
    }

    const publicRoot = resolve(process.cwd(), "public");
    const pathOnly = resource.fileUrl.split("?")[0]?.split("#")[0] ?? resource.fileUrl;
    const rel = pathOnly.replace(/^\/+/, "");
    const filePath = resolve(publicRoot, rel);
    const relCheck = relative(publicRoot, filePath);
    if (relCheck.startsWith("..") || relCheck.startsWith("/") || relCheck === "") {
      return new Response("Not found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const contentType = contentTypeFor(filePath);

    return new Response(fileBuffer, {
      headers: inlineHeaders(filePath, contentType),
    });
  } catch (e) {
    console.error("view-resource error:", e);
    return new Response("Server error", { status: 500 });
  }
}
