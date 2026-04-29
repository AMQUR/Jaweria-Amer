import { getSession } from "@/lib/admin/auth";
import { deleteCmsResource, getCmsResources, saveCmsResource } from "@/lib/admin/cms-store";
import { staticResources } from "@/lib/data";
import type { CmsResourceRecord } from "@/lib/admin/cms-types";

function staticToCmsRecord(r: (typeof staticResources)[number]): CmsResourceRecord {
  return {
    id: r.id,
    title: r.title,
    category: r.category as CmsResourceRecord["category"],
    subCategory: r.subCategory,
    paper: r.paper,
    section: r.section,
    fileUrl: r.fileUrl ?? "",
    type: r.type === "mcq" ? "mcq" : "pdf",
    visibility: "published",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    fileName: (r.fileUrl ?? "").split("/").pop() ?? "",
    subject: r.subject,
    level: r.level,
    year: r.year,
    description: r.description,
    source: "static",
  };
}

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const cmsResources = await getCmsResources();
    const byId = new Map<string, CmsResourceRecord>();
    for (const r of staticResources) byId.set(r.id, staticToCmsRecord(r));
    for (const r of Array.isArray(cmsResources) ? cmsResources : []) byId.set(r.id, r);
    return Response.json({ resources: Array.from(byId.values()) });
  } catch {
    return Response.json({ resources: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  try {
    const result = await saveCmsResource({
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
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json({ success: true, resource: result });
  } catch {
    return Response.json({ error: "Could not save resource." }, { status: 400 });
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
