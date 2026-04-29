import { getSession } from "@/lib/admin/auth";
import { getCourses } from "@/lib/admin/store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const courses = await getCourses();
    return Response.json(Array.isArray(courses) ? courses : []);
  } catch {
    return Response.json([]);
  }
}
