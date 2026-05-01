import { getCmsMcqSets, getSubmissionCounts } from "@/lib/admin/cms-store";
import { McqManager } from "@/components/admin/mcq-manager";

export default async function AdminMcqPage() {
  let data: Awaited<ReturnType<typeof getCmsMcqSets>> | null = null;
  let submissionCounts: Record<string, number> = {};
  try {
    const [r, counts] = await Promise.all([getCmsMcqSets(), getSubmissionCounts()]);
    data = Array.isArray(r) ? r : null;
    submissionCounts = counts ?? {};
  } catch {
    return <div />;
  }
  if (data == null) {
    return <div />;
  }
  return <McqManager initialMcqs={data} submissionCounts={submissionCounts} />;
}
