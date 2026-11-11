import { NextResponse } from "next/server";
import { EXAM_SERIES, SYLLABUSES } from "@/lib/exam/exam-dates";
import { getTimetable } from "@/lib/exam/timetable";

export const runtime = "nodejs";

/**
 * Read-only public feed of the one authoritative exam timetable, consumed by the LMS dashboard.
 * Contains public Cambridge exam dates only; no student or private data.
 */
export async function GET() {
  const { timetable, source } = await getTimetable();
  return NextResponse.json(
    {
      version: 1,
      source,
      series: EXAM_SERIES,
      timezone: "Asia/Karachi",
      syllabuses: SYLLABUSES.map(({ key, code, name, short }) => ({ key, code, name, short })),
      papers: timetable,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
