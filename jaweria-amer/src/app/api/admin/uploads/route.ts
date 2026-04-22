import { getSession } from "@/lib/admin/auth";
import { deleteUploadAsset, getUploadAssets } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(await getUploadAssets());
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
