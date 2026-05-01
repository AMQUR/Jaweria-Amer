import { getSession } from "@/lib/admin/auth";
import { deleteUploadAsset, getUploadAssets } from "@/lib/admin/cms-store";
import { bucketPathForUpload, uploadPdf } from "@/lib/admin/supabase-storage";
import type { CmsResourceCategory } from "@/lib/admin/cms-types";

const CATEGORY_TO_FOLDER: Record<CmsResourceCategory, string> = {
  "general-notes": "notes",
  topicals: "topicals",
  "yearly-past-papers": "yearlies",
  "examiner-reports": "scripts",
  checklists: "marking-schemes",
  "quick-worksheets": "mcq",
  vocabulary: "vocabulary",
  "solved-papers": "notes/solved-papers",
  featured: "featured",
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await getUploadAssets();
    return Response.json(Array.isArray(assets) ? assets : []);
  } catch {
    return Response.json([]);
  }
}

/** Direct PDF upload — returns { url } on success. Used by resource-manager. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return Response.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 25 MB.` },
      { status: 400 }
    );
  }

  const rawCategory = (formData.get("category") as string | null) ?? "general-notes";
  const category: CmsResourceCategory =
    rawCategory in CATEGORY_TO_FOLDER
      ? (rawCategory as CmsResourceCategory)
      : "general-notes";

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const folder = CATEGORY_TO_FOLDER[category];
  const bucketPath = bucketPathForUpload(folder, title || file.name);

  const result = await uploadPdf(file, bucketPath);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ url: result.url });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = (await request.json()) as { url?: string };
  if (!url) {
    return Response.json({ error: "Missing file URL." }, { status: 400 });
  }

  await deleteUploadAsset(url);
  return Response.json({ success: true });
}
