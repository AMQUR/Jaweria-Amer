import { saveMcqSubmission } from "@/lib/admin/cms-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      quizId?: string;
      score?: number;
      total?: number;
      answers?: string[];
    };

    const { quizId, score, total, answers } = body;

    if (!quizId || score === undefined || total === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    await saveMcqSubmission({
      quizId,
      score,
      total,
      answers: Array.isArray(answers) ? answers : [],
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Could not save submission" }, { status: 500 });
  }
}
