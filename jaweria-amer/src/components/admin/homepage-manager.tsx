"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageUp, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HomepageContent } from "@/lib/admin/cms-types";

export function HomepageManager() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  async function loadContent() {
    setLoading(true);
    const response = await fetch("/api/admin/homepage", { cache: "no-store" });
    const data = await response.json();
    setContent(data);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/homepage", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setContent(data);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content) return;
    setSaving(true);

    const body = new FormData();
    body.set("heroKicker", content.heroKicker);
    body.set("heroTitlePrimary", content.heroTitlePrimary);
    body.set("heroTitleSecondary", content.heroTitleSecondary);
    body.set("heroDescription", content.heroDescription);
    body.set("primaryCtaText", content.primaryCtaText);
    body.set("primaryCtaLink", content.primaryCtaLink);
    body.set("secondaryCtaText", content.secondaryCtaText);
    body.set("secondaryCtaLink", content.secondaryCtaLink);
    if (bannerFile) body.set("bannerFile", bannerFile);

    const response = await fetch("/api/admin/homepage", { method: "POST", body });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error(data.error ?? "Could not save homepage content.");
      return;
    }

    toast.success("Homepage content updated.");
    setBannerFile(null);
    await loadContent();
  }

  if (loading || !content) {
    return <div className="rounded-2xl border border-border/60 bg-white p-8 text-sm text-slate shadow-sm">Loading homepage content…</div>;
  }

  return (
    <form onSubmit={(event) => void handleSave(event)} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Homepage Content</h1>
          <p className="mt-1 text-sm text-slate">Edit the public hero copy, CTA wording, and banner image without touching the frontend layout.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Hero kicker">
              <Input value={content.heroKicker} onChange={(event) => setContent((prev) => prev ? { ...prev, heroKicker: event.target.value } : prev)} />
            </Field>
            <Field label="Primary CTA text">
              <Input value={content.primaryCtaText} onChange={(event) => setContent((prev) => prev ? { ...prev, primaryCtaText: event.target.value } : prev)} />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Hero title line 1">
              <Input value={content.heroTitlePrimary} onChange={(event) => setContent((prev) => prev ? { ...prev, heroTitlePrimary: event.target.value } : prev)} />
            </Field>
            <Field label="Hero title line 2">
              <Input value={content.heroTitleSecondary} onChange={(event) => setContent((prev) => prev ? { ...prev, heroTitleSecondary: event.target.value } : prev)} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Hero description">
              <Textarea rows={4} value={content.heroDescription} onChange={(event) => setContent((prev) => prev ? { ...prev, heroDescription: event.target.value } : prev)} />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Primary CTA link">
              <Input value={content.primaryCtaLink} onChange={(event) => setContent((prev) => prev ? { ...prev, primaryCtaLink: event.target.value } : prev)} />
            </Field>
            <Field label="Secondary CTA text">
              <Input value={content.secondaryCtaText} onChange={(event) => setContent((prev) => prev ? { ...prev, secondaryCtaText: event.target.value } : prev)} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Secondary CTA link">
              <Input value={content.secondaryCtaLink} onChange={(event) => setContent((prev) => prev ? { ...prev, secondaryCtaLink: event.target.value } : prev)} />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ImageUp className="h-4 w-4 text-brand" />
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Hero Banner</h2>
          </div>
          <p className="mt-1 text-sm text-slate">
            Uploading here replaces <code className="rounded bg-cream px-1.5 py-0.5">public/images/homepage-banner.png</code>.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-cream">
            <Image
              src={content.bannerImagePath}
              alt="Homepage banner preview"
              width={1200}
              height={630}
              className="h-auto w-full object-contain"
            />
          </div>
          <div className="mt-4">
            <Field label="Replace banner image">
              <Input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)} />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Safety</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
            <li>The frontend layout stays unchanged.</li>
            <li>The banner keeps the same public file path for stable rendering.</li>
            <li>Homepage edits are live as soon as the content is saved.</li>
          </ul>
          <Button type="submit" disabled={saving} className="mt-6 w-full gap-2 shadow-sm">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Homepage"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
