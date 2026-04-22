import { getSession } from "@/lib/admin/auth";
import { deleteCmsResource, getCmsResources, saveCmsResource } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resources = await getCmsResources();
  return Response.json(resources);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  try {
    const resource = await saveCmsResource({
      id: (formData.get("id") as string) || undefined,
      title: String(formData.get("title") || ""),
      category: formData.get("category") as never,
      subCategory: ((formData.get("subCategory") as string) || undefined) as never,
      paper: ((formData.get("paper") as string) || "").trim(),
      section: ((formData.get("section") as string) || "").trim() || undefined,
      visibility: formData.get("visibility") as "published" | "draft",
      subject: String(formData.get("subject") || "English Language 1123"),
      level: String(formData.get("level") || "O Level"),
      year: String(formData.get("year") || "Practice"),
      description: String(formData.get("description") || ""),
      autoDetectSection: formData.get("autoDetectSection") === "true",
      file: (formData.get("file") as File | null) ?? null,
    });
    return Response.json({ success: true, resource });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save resource." },
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
    return Response.json({ error: "Missing resource id." }, { status: 400 });
  }

  await deleteCmsResource(id);
  return Response.json({ success: true });
}
