import { getSession } from "@/lib/admin/auth";
import { deleteCmsMcqSet, getCmsMcqSets, saveCmsMcqSet } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mcqs = await getCmsMcqSets();
    return Response.json(Array.isArray(mcqs) ? mcqs : []);
  } catch {
    return Response.json([]);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await saveCmsMcqSet(body);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json({ success: true, mcq: result });
  } catch {
    return Response.json({ error: "Could not save MCQ set." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = (await request.json()) as { id?: string };
  if (!id) {
    return Response.json({ error: "Missing MCQ id." }, { status: 400 });
  }

  await deleteCmsMcqSet(id);
  return Response.json({ success: true });
}
