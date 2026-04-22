import { readFile } from "fs/promises";
import { relative, resolve } from "path";
import type { NextRequest } from "next/server";
import { getPublicResources } from "@/lib/public-cms";

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

    if (!resource.fileUrl.startsWith("/resources/")) {
      return new Response("Not found", { status: 404 });
    }

    const publicRoot = resolve(process.cwd(), "public");
    const rel = resource.fileUrl.replace(/^\/+/, "");
    const filePath = resolve(publicRoot, rel);
    const relCheck = relative(publicRoot, filePath);
    if (relCheck.startsWith("..") || relCheck.startsWith("/") || relCheck === "") {
      return new Response("Not found", { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error("view-resource error:", e);
    return new Response("Server error", { status: 500 });
  }
}
