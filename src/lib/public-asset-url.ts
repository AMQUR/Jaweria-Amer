import { headers } from "next/headers";

/**
 * Absolute URL for a public path (e.g. `/resources/file.pdf`) so third-party
 * viewers (e.g. Google Docs embed) can fetch the file.
 */
export async function publicFileAbsoluteUrl(path: string): Promise<string> {
  if (path.startsWith("https://") || path.startsWith("http://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}${normalized}`;
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    return normalized;
  }
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}${normalized}`;
}
