"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  FilePenLine,
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CMS_NOTES_SUBCATEGORY_OPTIONS,
  CMS_RESOURCE_CATEGORY_LABELS,
  CMS_RESOURCE_CATEGORY_OPTIONS,
  type CmsResourceRecord,
} from "@/lib/admin/cms-types";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type ResourceFormState = {
  id?: string;
  title: string;
  category: Exclude<CmsResourceRecord["category"], "quick-worksheets">;
  subCategory: string;
  paper: string;
  section: string;
  visibility: CmsResourceRecord["visibility"];
  subject: string;
  level: string;
  year: string;
  description: string;
  autoDetectSection: boolean;
  file: File | null;
};

const PDF_CATEGORY_OPTIONS = CMS_RESOURCE_CATEGORY_OPTIONS.filter((item) => item.value !== "quick-worksheets");

const emptyForm = (defaultCategory?: ResourceFormState["category"]): ResourceFormState => ({
  title: "",
  category: defaultCategory ?? "general-notes",
  subCategory: "",
  paper: "",
  section: "",
  visibility: "published",
  subject: "English Language 1123",
  level: "O Level",
  year: "Practice",
  description: "",
  autoDetectSection: true,
  file: null,
});

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB hard cap (client-side pre-check)

// Section order matching the public Resources page
const SECTION_ORDER: CmsResourceRecord["category"][] = [
  "general-notes",
  "topicals",
  "yearly-past-papers",
  "examiner-reports",
  "checklists",
  "vocabulary",
  "solved-papers",
  "quick-worksheets",
];

// ── Component ─────────────────────────────────────────────────────────────────

type ResourceManagerProps = {
  initialResources?: CmsResourceRecord[];
};

export function ResourceManager({ initialResources }: ResourceManagerProps) {
  const [resources, setResources] = useState<CmsResourceRecord[]>(() =>
    Array.isArray(initialResources) ? initialResources : []
  );
  const [loading, setLoading] = useState(initialResources === undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ResourceFormState>(emptyForm());
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  async function loadResources() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/resources", { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      const list: CmsResourceRecord[] =
        data && typeof data === "object" && Array.isArray((data as { resources?: unknown }).resources)
          ? (data as { resources: CmsResourceRecord[] }).resources
          : Array.isArray(data)
            ? (data as CmsResourceRecord[])
            : [];
      setResources(list);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResources();
  }, []);

  // Filter by search (section filtering is always shown)
  const visibleResources = useMemo(() => {
    if (!search.trim()) return resources;
    const q = search.toLowerCase();
    return resources.filter((r) => (r?.title ?? "").toLowerCase().includes(q));
  }, [resources, search]);

  function openCreate(defaultCategory?: ResourceFormState["category"]) {
    setForm(emptyForm(defaultCategory));
    setDialogOpen(true);
  }

  function openEdit(resource: CmsResourceRecord) {
    if (resource.type === "mcq") {
      toast.info("Quick Worksheets are edited from the MCQ Builder.");
      return;
    }
    setForm({
      id: resource.id,
      title: resource.title,
      category: resource.category as ResourceFormState["category"],
      subCategory: resource.subCategory ?? "",
      paper: resource.paper,
      section: resource.section ?? "",
      visibility: resource.visibility,
      subject: resource.subject,
      level: resource.level,
      year: resource.year,
      description: resource.description,
      autoDetectSection: resource.autoDetectSection ?? false,
      file: null,
    });
    setDialogOpen(true);
  }

  async function handleToggleVisibility(resource: CmsResourceRecord) {
    // MCQ resources are managed from the MCQ Builder — should not reach here,
    // but guard defensively so a category mismatch never fires a bad request.
    if (resource.type === "mcq") {
      toast.info("Quick Worksheets are managed from the MCQ Builder.");
      return;
    }
    try {
      const newVis = resource.visibility === "published" ? "draft" : "published";
      const body = new FormData();
      body.set("id", resource.id);
      body.set("title", resource.title ?? "");
      body.set("category", resource.category);
      body.set("subCategory", resource.subCategory ?? "");
      body.set("paper", resource.paper ?? "");
      body.set("section", resource.section ?? "");
      body.set("visibility", newVis);
      body.set("subject", resource.subject ?? "English Language 1123");
      body.set("level", resource.level ?? "O Level");
      body.set("year", resource.year ?? "Practice");
      body.set("description", resource.description ?? "");
      body.set("autoDetectSection", String(resource.autoDetectSection ?? false));

      const response = await fetch("/api/admin/resources", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        toast.error((data as { error?: string }).error ?? "Could not update visibility.");
        return;
      }
      toast.success(newVis === "published" ? "Resource published." : "Resource hidden.");
      await loadResources();
    } catch {
      toast.error("Network error — could not update visibility.");
    }
  }

  async function handleDelete(resource: CmsResourceRecord) {
    const isStatic = resource.source === "static";
    const label = isStatic ? "hide" : "delete";
    const message = isStatic
      ? `Hide "${resource.title}" from the public? Built-in resources can only be hidden, not permanently removed.`
      : `Delete "${resource.title}"? This will also remove the uploaded file.`;
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    const response = await fetch("/api/admin/resources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resource.id }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error((data as { error?: string }).error ?? `Could not ${label} resource.`);
      return;
    }
    toast.success(isStatic ? "Resource hidden from public." : "Resource deleted.");
    await loadResources();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Client-side file size guard
    if (form.file && form.file.size > MAX_FILE_BYTES) {
      toast.error(`File is too large (${(form.file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: 20 MB.`);
      return;
    }

    setSaving(true);

    const body = new FormData();
    if (form.id) body.set("id", form.id);
    body.set("title", form.title);
    body.set("category", form.category);
    body.set("subCategory", form.subCategory);
    body.set("paper", form.paper);
    body.set("section", form.section);
    body.set("visibility", form.visibility);
    body.set("subject", form.subject);
    body.set("level", form.level);
    body.set("year", form.year);
    body.set("description", form.description);
    body.set("autoDetectSection", String(form.autoDetectSection));
    if (form.file) body.set("file", form.file);

    if (form.file && form.file.size > 0) {
      // Use XHR for upload progress tracking
      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          setUploadProgress(null);
          setSaving(false);
          try {
            const data = JSON.parse(xhr.responseText) as { error?: string };
            if (xhr.status < 200 || xhr.status >= 300 || data.error) {
              toast.error(data.error ?? "Could not save resource.");
            } else {
              setLastSaved(form.title);
              toast.success(form.id ? "Resource updated." : "Resource added.");
              setDialogOpen(false);
              setForm(emptyForm());
              void loadResources();
            }
          } catch {
            toast.error("Could not save resource.");
          }
          resolve();
        });
        xhr.addEventListener("error", () => {
          setUploadProgress(null);
          setSaving(false);
          toast.error("Network error while uploading.");
          resolve();
        });
        xhr.open("POST", "/api/admin/resources");
        xhr.send(body);
      });
    } else {
      const response = await fetch("/api/admin/resources", { method: "POST", body });
      const data = await response.json();
      setSaving(false);
      if (!response.ok) {
        toast.error((data as { error?: string }).error ?? "Could not save resource.");
        return;
      }
      setLastSaved(form.title);
      toast.success(form.id ? "Resource updated." : "Resource added.");
      setDialogOpen(false);
      setForm(emptyForm());
      await loadResources();
    }
  }

  function toggleSection(category: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const totalCount = resources.filter((r) => !r.deleted).length;
  const publishedCount = resources.filter((r) => !r.deleted && r.visibility === "published").length;

  return (
    <div className="space-y-6">
      {/* Upload success banner */}
      {lastSaved && (
        <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-3">
          <p className="text-sm font-medium text-green-700">
            ✓ &ldquo;{lastSaved}&rdquo; saved successfully — live on site after next deploy.
          </p>
          <button
            type="button"
            onClick={() => setLastSaved(null)}
            className="ml-4 text-xs font-semibold text-green-600 hover:text-green-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Resources Control Center</h1>
          <p className="mt-1 text-sm text-slate">
            {totalCount} resources · {publishedCount} published. Sections mirror the public Resources page layout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-light" />
            <Input
              className="w-56 pl-9"
              placeholder="Search resources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => openCreate()} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-white px-5 py-3 text-xs shadow-sm">
        <span className="font-medium text-slate">Badges:</span>
        <Badge variant="builtin">Built-in</Badge>
        <span className="text-muted-foreground">= static resource (read-only)</span>
        <Badge variant="published">published</Badge>
        <span className="text-muted-foreground">= visible to students</span>
        <Badge variant="draft">draft</Badge>
        <span className="text-muted-foreground">= hidden from public</span>
      </div>

      {/* Section cards */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate">Loading resources…</div>
      ) : (
        <div className="space-y-4">
          {SECTION_ORDER.map((category) => {
            const sectionVisible = visibleResources.filter((r) => r.category === category && !r.deleted);
            const hiddenCount = resources.filter((r) => r.category === category && r.deleted).length;
            const label = CMS_RESOURCE_CATEGORY_LABELS[category];
            const collapsed = collapsedSections.has(category);
            const isQuickWorksheets = category === "quick-worksheets";

            return (
              <div key={category} className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
                {/* Section header */}
                <div className="flex items-center gap-3 border-b border-border/60 bg-cream/40 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleSection(category)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {collapsed ? (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-light" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-light" />
                    )}
                    <span className="font-serif text-base font-semibold tracking-tight text-ink">{label}</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {sectionVisible.length}
                    </span>
                    {hiddenCount > 0 && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                        {hiddenCount} hidden
                      </span>
                    )}
                  </button>
                  {isQuickWorksheets ? (
                    <Link href="/admin/mcq">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open MCQ Builder
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => openCreate(category as ResourceFormState["category"])}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  )}
                </div>

                {/* Section body */}
                {!collapsed && (
                  <div className="p-4">
                    {isQuickWorksheets ? (
                      <p className="py-2 text-sm text-slate">
                        Quick Worksheets (MCQ assessments) are managed from the{" "}
                        <Link href="/admin/mcq" className="font-medium text-crimson hover:underline">
                          MCQ Builder
                        </Link>
                        . Use that page to create, edit, and preview quizzes.
                      </p>
                    ) : sectionVisible.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          {search ? "No matching resources in this section." : "No resources yet — add the first one."}
                        </p>
                        {!search && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => openCreate(category as ResourceFormState["category"])}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Resource
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {sectionVisible.map((resource) => (
                          <ResourceRow
                            key={resource.id}
                            resource={resource}
                            onEdit={openEdit}
                            onToggleVisibility={handleToggleVisibility}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold tracking-tight text-ink">
              {form.id ? "Edit resource" : "Add resource"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </Field>
              <Field label="PDF file (max 20 MB)">
                <div className="space-y-1.5">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))}
                  />
                  {form.file && (
                    <p className={`text-xs ${form.file.size > MAX_FILE_BYTES ? "text-red-600 font-medium" : "text-slate"}`}>
                      {form.file.name} — {(form.file.size / 1024 / 1024).toFixed(1)} MB
                      {form.file.size > MAX_FILE_BYTES && " (exceeds 20 MB limit)"}
                    </p>
                  )}
                </div>
              </Field>
            </div>

            {/* Upload progress bar */}
            {uploadProgress !== null && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate">
                  <span className="flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Uploading…
                  </span>
                  <span className="tabular-nums font-medium text-ink">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-crimson transition-[width] duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                label="Category"
                value={form.category}
                onChange={(value) => setForm((prev) => ({ ...prev, category: value as ResourceFormState["category"] }))}
              >
                {PDF_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <Field label="Visibility">
                <select
                  className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, visibility: event.target.value as ResourceFormState["visibility"] }))
                  }
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </Field>
              <Field label="Notes sub-category">
                <select
                  className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
                  value={form.subCategory}
                  onChange={(event) => setForm((prev) => ({ ...prev, subCategory: event.target.value }))}
                  disabled={form.category !== "general-notes"}
                >
                  <option value="">Auto / none</option>
                  {CMS_NOTES_SUBCATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="rounded-2xl border border-border/60 bg-cream p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">Auto-detect paper and section</p>
                  <p className="text-xs text-muted-foreground">
                    Use title + filename keywords to classify Paper 1 / Paper 2 and section labels.
                  </p>
                </div>
                <Switch
                  checked={form.autoDetectSection}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, autoDetectSection: checked }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Paper">
                <input
                  className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
                  value={form.paper}
                  onChange={(event) => setForm((prev) => ({ ...prev, paper: event.target.value }))}
                  placeholder="Paper 1"
                />
              </Field>
              <Field label="Section">
                <input
                  className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
                  value={form.section}
                  onChange={(event) => setForm((prev) => ({ ...prev, section: event.target.value }))}
                  placeholder="Comprehension"
                />
              </Field>
              <Field label="Year / session">
                <Input
                  value={form.year}
                  onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Subject">
                <Input
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                />
              </Field>
              <Field label="Level">
                <Input
                  value={form.level}
                  onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
                />
              </Field>
            </div>

            <Field label="Description">
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Field>

            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-cream p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Uploaded PDFs are saved into{" "}
                <code className="rounded bg-white px-1.5 py-0.5">public/resources/&lt;category&gt;/</code> and served
                locally. On Vercel, uploads require a writable storage backend.
              </p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2 shadow-sm">
                  {saving && uploadProgress !== null ? (
                    <>
                      <Upload className="h-4 w-4" />
                      {uploadProgress}%
                    </>
                  ) : saving ? (
                    "Saving…"
                  ) : form.id ? (
                    "Save Changes"
                  ) : (
                    "Create Resource"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResourceRow({
  resource,
  onEdit,
  onToggleVisibility,
  onDelete,
}: {
  resource: CmsResourceRecord;
  onEdit: (r: CmsResourceRecord) => void;
  onToggleVisibility: (r: CmsResourceRecord) => void;
  onDelete: (r: CmsResourceRecord) => void;
}) {
  const isStatic = resource.source === "static";
  const isPublished = resource.visibility === "published";

  return (
    <div className="flex items-center gap-3 py-3">
      <span className="shrink-0 rounded-xl bg-muted p-2 text-brand">
        <FileText className="h-4 w-4" />
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{resource.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {resource.paper && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {resource.paper}
            </span>
          )}
          {resource.section && (
            <span className="text-[11px] text-muted-foreground">{resource.section}</span>
          )}
          <Badge variant={isPublished ? "published" : "draft"}>
            {isPublished ? "published" : "draft"}
          </Badge>
          {isStatic && <Badge variant="builtin">Built-in</Badge>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        {resource.fileUrl ? (
          <a
            href={`/resources/view/${resource.id}`}
            className="rounded-xl p-2 text-slate transition-colors hover:bg-muted hover:text-ink"
            aria-label={`Open ${resource.title}`}
            title="View resource"
          >
            <Eye className="h-4 w-4" />
          </a>
        ) : (
          <span className="w-8" />
        )}

        {!isStatic && (
          <>
            {/* Visibility toggle */}
            <button
              type="button"
              onClick={() => void onToggleVisibility(resource)}
              className="rounded-xl p-2 text-slate transition-colors hover:bg-muted hover:text-ink"
              aria-label={isPublished ? "Hide resource" : "Publish resource"}
              title={isPublished ? "Hide from public" : "Make public"}
            >
              {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(resource)}
              className="rounded-xl p-2 text-slate transition-colors hover:bg-muted hover:text-ink"
              aria-label={`Edit ${resource.title}`}
              title="Edit"
            >
              <FilePenLine className="h-4 w-4" />
            </button>
            {/* Delete */}
            <button
              type="button"
              onClick={() => void onDelete(resource)}
              className="rounded-xl p-2 text-slate transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${resource.title}`}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}

        {isStatic && (
          /* Built-in: only allow hiding */
          <button
            type="button"
            onClick={() => void onDelete(resource)}
            className="rounded-xl p-2 text-slate transition-colors hover:bg-amber-50 hover:text-amber-600"
            aria-label={`Hide ${resource.title}`}
            title="Hide from public"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Badge({
  variant,
  children,
}: {
  variant: "builtin" | "published" | "draft";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variant === "builtin" && "bg-blue-50 text-blue-600",
        variant === "published" && "bg-green-50 text-green-700",
        variant === "draft" && "bg-amber-50 text-amber-700"
      )}
    >
      {children}
    </span>
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

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-slate">{label}</span>
      <select
        className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}
