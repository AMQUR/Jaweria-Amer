import { getSession } from "@/lib/admin/auth";
import { getSettings, saveSettings } from "@/lib/admin/store";

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const settings = await getSettings();
    return Response.json(settings ?? {});
  } catch {
    return Response.json({});
  }
}

type SettingsBody = {
  whatsappNumber?: unknown;
  stats?: unknown;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.authenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as SettingsBody;
    const stats = Array.isArray(body.stats)
      ? body.stats.map((s) => {
          const row = s as { label?: unknown; value?: unknown };
          return {
            label: String(row?.label ?? "").trim(),
            value: String(row?.value ?? "").trim(),
          };
        })
      : [];
    const valid = stats.filter((s) => s.value && s.label);
    if (valid.length === 0 || valid.length > 6) {
      return Response.json({ error: "Add between 1 and 6 stats with value and label." }, { status: 400 });
    }
    const wa = String(body.whatsappNumber ?? "").trim();
    if (wa.length < 10) {
      return Response.json({ error: "Invalid WhatsApp number." }, { status: 400 });
    }
    await saveSettings({
      whatsappNumber: wa,
      stats: valid,
    });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Could not save settings." }, { status: 400 });
  }
}
