"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import { EXAM_SERIES, isSyllabusKey } from "@/lib/exam/exam-dates";

/** Update one paper date in the authoritative timetable. Admin session required. */
export async function updateExamDate(formData: FormData) {
  await requireAuth();
  const key = String(formData.get("syllabus") ?? "");
  const paper = String(formData.get("paper") ?? "");
  const date = String(formData.get("date") ?? "");
  const session = formData.get("session") === "Afternoon" ? "Afternoon" : "Morning";
  if (!isSyllabusKey(key) || !paper || paper.length > 60 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svc) return;
  await fetch(
    `${url}/rest/v1/exam_timetable?syllabus_key=eq.${encodeURIComponent(key)}&paper=eq.${encodeURIComponent(paper)}&series=eq.${encodeURIComponent(EXAM_SERIES.label)}`,
    {
      method: "PATCH",
      headers: { apikey: svc, Authorization: `Bearer ${svc}`, "Content-Type": "application/json" },
      body: JSON.stringify({ exam_date: date, session, updated_at: new Date().toISOString() }),
      cache: "no-store",
    },
  );
  revalidatePath("/admin/exam-dates");
  revalidatePath("/exam-countdown");
  revalidatePath("/study-plan", "layout");
}
