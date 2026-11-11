import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  processEnquiryNotifications,
  sendHistoricalWorkbook,
} from "@/lib/registration/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Accepts Vercel Cron (its user-agent) or, when CRON_SECRET is configured, the matching bearer.
 * This route is safe to be poked by anyone: it only drains rows that are already due (back-off
 * gated, leased, provider-idempotent) and never accepts input or returns enquiry data.
 */
function authorised(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret && secret.length >= 24) {
    const given = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${secret}`;
    if (
      given.length === expected.length &&
      timingSafeEqual(Buffer.from(given), Buffer.from(expected))
    )
      return true;
  }
  return (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/");
}

/**
 * Retry worker for teacher enquiry emails (Vercel Cron, every 10 minutes).
 * 1. Sends the one consolidated historical workbook until the provider has accepted it once.
 * 2. Retries pending/failed enquiry notices with back-off.
 */
export async function GET(request: NextRequest) {
  if (!authorised(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const headers = { "Cache-Control": "no-store" };
  let historical: unknown = null;
  try {
    historical = await sendHistoricalWorkbook();
  } catch {
    historical = { error: "historical export failed" };
  }
  const queue = await processEnquiryNotifications(10);
  return NextResponse.json({ historical, queue }, { headers });
}
