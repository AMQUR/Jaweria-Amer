import { getUploadAssets } from "@/lib/admin/cms-store";
import { UploadManager } from "@/components/admin/upload-manager";

export default async function AdminUploadsPage() {
  let data: Awaited<ReturnType<typeof getUploadAssets>> | null = null;
  try {
    const r = await getUploadAssets();
    data = Array.isArray(r) ? r : null;
  } catch {
    return <div />;
  }
  if (data == null) {
    return <div />;
  }
  return <UploadManager initialAssets={data} />;
}
