import { getSession } from "@/lib/admin/auth";
import { deleteCmsMcqSet, getCmsMcqSets, saveCmsMcqSet } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(await getCmsMcqSets());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const mcq = await saveCmsMcqSet(body);
    return Response.json({ success: true, mcq });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save MCQ set." },
      { status: 400 }
    );
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
