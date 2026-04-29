import { getCmsResources } from "@/lib/admin/cms-store";
import { ResourceManager } from "@/components/admin/resource-manager";

export default async function AdminResourcesPage() {
  let data: Awaited<ReturnType<typeof getCmsResources>> | null = null;
  try {
    const r = await getCmsResources();
    data = Array.isArray(r) ? r : null;
  } catch {
    return <div />;
  }
  if (data == null) {
    return <div />;
  }
  return <ResourceManager initialResources={data} />;
}
