import { getSession } from "@/lib/admin/auth";
import { getSubmissionCounts } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const counts = await getSubmissionCounts();
    return Response.json(counts);
  } catch {
    return Response.json({});
  }
}
