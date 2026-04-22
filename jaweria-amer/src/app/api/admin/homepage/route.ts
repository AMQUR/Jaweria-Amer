import { getSession } from "@/lib/admin/auth";
import { getHomepageContent, saveHomepageContent } from "@/lib/admin/cms-store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(await getHomepageContent());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  try {
    const content = await saveHomepageContent({
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

    return Response.json({ success: true, content });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save homepage content." },
      { status: 400 }
    );
  }
}
