import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/auth";
import { listAllRegistrations } from "@/lib/registration/server";
import { enquiriesToXlsx, enquiryFilename } from "@/lib/registration/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

/**
 * Admin-only download of the stored enquiries as an Excel sheet. When the
 * list is capped the file name and a notice row inside the sheet say so.
 * Guarded twice: src/proxy.ts rejects unauthenticated /api/admin/* requests,
 * and the handler re-checks the signed session itself.
 */
export async function GET() {
  const session = await getSession();
  if (!session.authenticated)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: PRIVATE_HEADERS },
    );
  try {
    const { leads, complete } = await listAllRegistrations();
    const body = enquiriesToXlsx(leads, { complete });
    return new NextResponse(new Uint8Array(body), {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${enquiryFilename(new Date(), complete)}"`,
        "X-Enquiries-Complete": String(complete),
      },
    });
  } catch (error) {
    // Error class only: an export failure must never put enquiry data in logs.
    console.error(
      "[registration] export failed",
      error instanceof Error ? error.name : "unknown",
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message.slice(0, 120)
        : "",
    );
    return NextResponse.json(
      { error: "Export unavailable" },
      { status: 503, headers: PRIVATE_HEADERS },
    );
  }
}
