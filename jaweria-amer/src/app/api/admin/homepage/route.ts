import { getSession } from "@/lib/admin/auth";
import { getHomepageContent, saveHomepageContent } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await getHomepageContent();
    return Response.json(content ?? {});
  } catch {
    return Response.json({});
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  try {
    const result = await saveHomepageContent({
      heroKicker: String(formData.get("heroKicker") || ""),
      heroTitlePrimary: String(formData.get("heroTitlePrimary") || ""),
      heroTitleSecondary: String(formData.get("heroTitleSecondary") || ""),
      heroDescription: String(formData.get("heroDescription") || ""),
      primaryCtaText: String(formData.get("primaryCtaText") || ""),
      primaryCtaLink: String(formData.get("primaryCtaLink") || ""),
      secondaryCtaText: String(formData.get("secondaryCtaText") || ""),
      secondaryCtaLink: String(formData.get("secondaryCtaLink") || ""),
      bannerFile: (formData.get("bannerFile") as File | null) ?? null,
    });
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json({ success: true, content: result });
  } catch {
    return Response.json({ error: "Could not save homepage content." }, { status: 400 });
  }
}
