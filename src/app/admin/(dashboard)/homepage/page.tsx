import { getHomepageContent } from "@/lib/admin/cms-store";
import { HomepageManager } from "@/components/admin/homepage-manager";

export default async function AdminHomepagePage() {
  let data: Awaited<ReturnType<typeof getHomepageContent>> | null = null;
  try {
    data = await getHomepageContent();
  } catch {
    return <div />;
  }
  if (data == null) {
    return <div />;
  }
  return <HomepageManager initialContent={data} />;
}
