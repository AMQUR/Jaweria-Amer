import { getSession } from "@/lib/admin/auth";
import { getSubmissionStats } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getSubmissionStats();
    return Response.json(stats);
  } catch {
    return Response.json({ counts: {}, avgScores: {} });
  }
}
