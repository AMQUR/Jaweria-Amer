"use client";

import { useEffect, useState, useActionState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettingsAction } from "@/lib/admin/actions";
import { defaultSettings } from "@/lib/admin/defaults";
import type { SiteSettings } from "@/lib/admin/store";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = res.ok ? await res.json() : null;
      if (data && typeof data === "object" && !("error" in data)) {
        const raw = data as SiteSettings;
        const defaultStats = defaultSettings.stats.map((s) => ({ value: s.value, label: s.label }));
        setSettings({
          whatsappNumber: String(raw.whatsappNumber ?? defaultSettings.whatsappNumber),
          stats: Array.isArray(raw.stats) ? raw.stats.map((s) => ({ value: String(s.value), label: String(s.label) })) : defaultStats,
        });
      } else {
        setSettings({
          whatsappNumber: defaultSettings.whatsappNumber,
          stats: defaultSettings.stats.map((s) => ({ value: s.value, label: s.label })),
        });
      }
    } catch {
      setSettings({
        whatsappNumber: defaultSettings.whatsappNumber,
        stats: defaultSettings.stats.map((s) => ({ value: s.value, label: s.label })),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const [formState, formAction, formPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    const result = await saveSettingsAction(_prev, formData);
    if (result?.success) {
      toast.success("Settings saved");
      fetchSettings();
    }
    return result;
  }, null);

  function addStat() {
    if (!settings) return;
    setSettings({
      ...settings,
      stats: [...settings.stats, { value: "", label: "" }],
    });
  }

  function removeStat(index: number) {
    if (!settings || settings.stats.length <= 1) return;
    setSettings({
      ...settings,
      stats: settings.stats.filter((_, i) => i !== index),
    });
  }

  function updateStat(index: number, field: "value" | "label", val: string) {
    if (!settings) return;
    const newStats = [...settings.stats];
    newStats[index] = { ...newStats[index], [field]: val };
    setSettings({ ...settings, stats: newStats });
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink mb-6">Settings</h1>
        <div className="p-12 text-center text-slate-light text-sm">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return <div />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Global Settings</h1>
        <p className="text-sm text-slate mt-1">Update site-wide configuration</p>
      </div>

      <form action={formAction} className="space-y-6 max-w-2xl">
        <input type="hidden" name="statsCount" value={settings.stats.length} />

        {formState?.error && (
          <div className="rounded-xl border border-brand/25 bg-brand-soft px-4 py-2.5 text-sm text-brand shadow-sm">
            {formState.error}
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold tracking-tight text-ink mb-4">WhatsApp Contact</h2>
          <div className="space-y-1.5">
            <Label htmlFor="whatsappNumber">WhatsApp Number (with country code)</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="923253708069"
              required
            />
            <p className="text-xs text-slate-light">Format: country code + number, no spaces or dashes (e.g., 923253708069)</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Results Ticker</h2>
            {settings.stats.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addStat} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Stat
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-light mb-4">These statistics appear on the home page below the hero.</p>

          <div className="space-y-3">
            {settings.stats.map((stat, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`stat_value_${i}`} className="text-xs">Value</Label>
                    <Input
                      id={`stat_value_${i}`}
                      name={`stat_value_${i}`}
                      value={stat.value}
                      onChange={(e) => updateStat(i, "value", e.target.value)}
                      placeholder="95%"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`stat_label_${i}`} className="text-xs">Label</Label>
                    <Input
                      id={`stat_label_${i}`}
                      name={`stat_label_${i}`}
                      value={stat.label}
                      onChange={(e) => updateStat(i, "label", e.target.value)}
                      placeholder="Students scored A*/A"
                      required
                    />
                  </div>
                </div>
                {settings.stats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="mt-6 rounded-lg p-1.5 text-slate transition-colors hover:bg-brand-soft hover:text-brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={formPending} className="shadow-sm">
            {formPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
