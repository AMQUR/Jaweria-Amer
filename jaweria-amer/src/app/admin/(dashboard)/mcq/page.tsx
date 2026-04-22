import { getCmsMcqSets } from "@/lib/admin/cms-store";
import { McqManager } from "@/components/admin/mcq-manager";

export default async function AdminMcqPage() {
  let data: Awaited<ReturnType<typeof getCmsMcqSets>> | null = null;
  try {
    const r = await getCmsMcqSets();
    data = Array.isArray(r) ? r : null;
  } catch {
    return <div />;
  }
  if (data == null) {
    return <div />;
  }
  return <McqManager initialMcqs={data} />;
}
