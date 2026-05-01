import { saveMcqSubmission } from "@/lib/admin/cms-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      quizId?: unknown;
      score?: unknown;
      total?: unknown;
      answers?: unknown;
    };

    const quizId = typeof body.quizId === "string" ? body.quizId.trim() : "";
    const score = Number(body.score);
    const total = Number(body.total);
    const answers = Array.isArray(body.answers) ? (body.answers as unknown[]).map(String) : [];

    if (!quizId) {
      return Response.json({ error: "Missing quizId." }, { status: 400 });
    }
    if (!isFinite(score) || score < 0) {
      return Response.json({ error: "Invalid score." }, { status: 400 });
    }
    if (!isFinite(total) || total <= 0) {
      return Response.json({ error: "Invalid total." }, { status: 400 });
    }
    if (score > total) {
      return Response.json({ error: "Score cannot exceed total." }, { status: 400 });
    }

    await saveMcqSubmission({
      quizId,
      score: Math.round(score),
      total: Math.round(total),
      answers,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Could not save submission." }, { status: 500 });
  }
}
