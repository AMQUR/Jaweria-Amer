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
 * When CRON_SECRET is configured (the supported setup) only the matching bearer is accepted;
 * Vercel Cron sends it automatically. Until the secret is added, a Vercel Cron user-agent is
 * accepted as a bootstrap fallback. That header is spoofable, so the fallback is deliberately
 * low-impact: it only drains rows that are already due (back-off gated, leased, provider
 * idempotent), triggers the one-time historical workbook to the same teacher address, takes no
 * input, and returns no data. It switches itself off as soon as CRON_SECRET is set.
 */
function authorised(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret && secret.length >= 24) {
    const given = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${secret}`;
    return (
      given.length === expected.length &&
      timingSafeEqual(Buffer.from(given), Buffer.from(expected))
    );
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
  try {
    // Outcomes are recorded in Supabase (enquiry_exports / notify_status), not returned here.
    await sendHistoricalWorkbook();
  } catch (error) {
    // Error class and upstream status only: never enquiry data.
    console.error(
      "[registration] historical export failed",
      error instanceof Error ? error.name : "unknown",
      (error as { kind?: string; httpStatus?: number })?.kind ?? "",
      (error as { httpStatus?: number })?.httpStatus ?? "",
      error instanceof Error ? error.message.slice(0, 80) : "",
    );
  }
  const run = await processEnquiryNotifications(10);
  // Privacy-safe heartbeat for Vercel runtime logs: counts only, no enquiry data.
  console.info("[registration] cron ok", `claimed=${run.claimed}`, `sent=${run.sent}`, `failed=${run.failed}`);
  return NextResponse.json({ ok: true }, { headers });
}
