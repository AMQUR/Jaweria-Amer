"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { UploadAsset } from "@/lib/admin/cms-types";

type UploadManagerProps = {
  initialAssets?: UploadAsset[];
};

export function UploadManager({ initialAssets }: UploadManagerProps) {
  const [assets, setAssets] = useState<UploadAsset[]>(() => (Array.isArray(initialAssets) ? initialAssets : []));
  const [loading, setLoading] = useState(initialAssets === undefined);

  async function loadAssets() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/uploads", { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, []);

  async function handleDelete(url: string) {
    const confirmed = window.confirm(`Delete ${url}?`);
    if (!confirmed) return;

    const response = await fetch("/api/admin/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Could not delete file.");
      return;
    }
    toast.success("File removed.");
    await loadAssets();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Uploads</h1>
        <p className="mt-1 text-sm text-slate">
          Review uploaded public assets. Resource uploads live under <code className="rounded bg-cream px-1.5 py-0.5">public/resources</code>.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate">Loading uploads…</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto h-10 w-10 text-slate-light/50" />
            <p className="mt-3 text-sm text-slate">No uploaded assets found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {assets.map((asset) => (
              <div key={asset.url} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-ink">{asset.fileName}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {asset.url} · {(asset.size / 1024).toFixed(1)} KB · updated {new Date(asset.updatedAt).toLocaleString()}
                  </p>
                </div>
                {asset.url.startsWith("/resources/") ? (
                  <Button type="button" variant="outline" onClick={() => void handleDelete(asset.url)} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : (
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">System file</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
