"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, FilePenLine, FileText, Filter, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CMS_NOTES_SUBCATEGORY_OPTIONS,
  CMS_RESOURCE_CATEGORY_LABELS,
  CMS_RESOURCE_CATEGORY_OPTIONS,
  type CmsResourceRecord,
} from "@/lib/admin/cms-types";

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

const emptyForm = (): ResourceFormState => ({
  title: "",
  category: "general-notes",
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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paperFilter, setPaperFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState<ResourceFormState>(emptyForm());
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  async function loadResources() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/resources", { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      if (search && !(resource?.title ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && resource.category !== categoryFilter) return false;
      if (paperFilter !== "all" && resource.paper !== paperFilter) return false;
      if (sectionFilter !== "all" && (resource.section || "") !== sectionFilter) return false;
      if (typeFilter !== "all" && resource.type !== typeFilter) return false;
      return true;
    });
  }, [resources, search, categoryFilter, paperFilter, sectionFilter, typeFilter]);

  const groupingPreview = useMemo(() => {
    return ["Paper 1", "Paper 2"].map((paper) => {
      const rows = resources.filter(
        (resource) =>
          (resource.category === "topicals" || resource.category === "checklists") &&
          resource.paper === paper &&
          !resource.deleted
      );
      const sections = [...new Set(rows.map((row) => row.section).filter(Boolean) as string[])];
      return { paper, count: rows.length, sections };
    });
  }, [resources]);

  function openCreate() {
    setForm(emptyForm());
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

  async function handleDelete(resource: CmsResourceRecord) {
    const confirmed = window.confirm(`Delete "${resource.title}"? This also removes uploaded files when applicable.`);
    if (!confirmed) return;

    const response = await fetch("/api/admin/resources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resource.id }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Could not delete resource.");
      return;
    }
    toast.success("Resource deleted.");
    await loadResources();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    const response = await fetch("/api/admin/resources", { method: "POST", body });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error(data.error ?? "Could not save resource.");
      return;
    }

    setLastSaved(form.title);
    toast.success(form.id ? "Resource updated." : "Resource added.");
    setDialogOpen(false);
    setForm(emptyForm());
    await loadResources();
  }

  return (
    <div className="space-y-6">
      {lastSaved && (
        <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-3">
          <p className="text-sm font-medium text-green-700">
            ✓ &ldquo;{lastSaved}&rdquo; uploaded successfully → Live on site
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

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Resources Control Center</h1>
          <p className="mt-1 text-sm text-slate">
            Manage the live resource library, file metadata, paper/section grouping, and publication status.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand" />
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Filter Library</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-light" />
                <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
            </label>
            <SelectField label="Category" value={categoryFilter} onChange={setCategoryFilter}>
              <option value="all">All categories</option>
              {CMS_RESOURCE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField label="Paper" value={paperFilter} onChange={setPaperFilter}>
              <option value="all">All papers</option>
              <option value="Paper 1">Paper 1</option>
              <option value="Paper 2">Paper 2</option>
              <option value="Grammar">Grammar</option>
            </SelectField>
            <SelectField label="Section" value={sectionFilter} onChange={setSectionFilter}>
              <option value="all">All sections</option>
              {[...new Set(resources.map((item) => item.section).filter(Boolean) as string[])].map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </SelectField>
            <SelectField label="Type" value={typeFilter} onChange={setTypeFilter}>
              <option value="all">All types</option>
              <option value="pdf">PDF</option>
              <option value="mcq">MCQ</option>
            </SelectField>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Paper → Section Preview</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {groupingPreview.map((group) => (
              <div key={group.paper} className="rounded-2xl border border-border/60 bg-cream p-4">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-base font-semibold tracking-tight text-ink">{group.paper}</p>
                  <span className="text-xs text-muted-foreground">{group.count} items</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate">
                  {group.sections.length ? group.sections.join(" · ") : "No sections assigned yet"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate">Loading resources…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category → Sub</TableHead>
                <TableHead>Paper</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-xl bg-muted p-2 text-brand">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-ink">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.fileName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate">
                    {CMS_RESOURCE_CATEGORY_LABELS[resource.category]}
                    {resource.subCategory && (
                      <span className="ml-1 text-muted-foreground">→ {resource.subCategory}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate">{resource.paper || "—"}</TableCell>
                  <TableCell className="text-sm text-slate uppercase">{resource.type}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        resource.visibility === "published" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {resource.visibility}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{resource.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <a
                        href={`/resources/view/${resource.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl p-2 text-slate transition-[background-color,color] hover:bg-muted hover:text-ink"
                        aria-label={`View ${resource.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      {resource.source !== "static" && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(resource)}
                            className="rounded-xl p-2 text-slate transition-[background-color,color] hover:bg-muted hover:text-ink"
                            aria-label={`Edit ${resource.title}`}
                          >
                            <FilePenLine className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(resource)}
                            className="rounded-xl p-2 text-slate transition-[background-color,color] hover:bg-brand-soft hover:text-brand"
                            aria-label={`Delete ${resource.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
                <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
              </Field>
              <Field label="PDF file">
                <Input type="file" accept=".pdf" onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SelectField label="Category" value={form.category} onChange={(value) => setForm((prev) => ({ ...prev, category: value as ResourceFormState["category"] }))}>
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
                  onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value as ResourceFormState["visibility"] }))}
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
                <Input value={form.year} onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Subject">
                <Input value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} />
              </Field>
              <Field label="Level">
                <Input value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))} />
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
                Quick Worksheets are managed from the MCQ Builder. Uploaded PDFs are auto-saved into
                <code className="ml-1 rounded bg-white px-1.5 py-0.5">public/resources/&lt;category&gt;/</code>.
              </p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="shadow-sm">
                  {saving ? "Saving…" : form.id ? "Save Changes" : "Create Resource"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
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
