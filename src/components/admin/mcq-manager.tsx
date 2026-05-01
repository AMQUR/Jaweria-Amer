"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Grip, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CmsMcqSet } from "@/lib/admin/cms-types";
import type { McqOption, McqQuestion } from "@/lib/mcq-data";

type McqForm = {
  id?: string;
  title: string;
  description: string;
  timeLimit: string;
  visibility: "published" | "draft";
  paper: string;
  section: string;
  subject: string;
  level: string;
  year: string;
  questions: McqQuestion[];
};

const blankQuestion = (): McqQuestion => ({
  section: "A",
  question: "",
  options: { A: "", B: "", C: "", D: "" },
  answer: "A",
  explanation: "",
});

const emptyMcqForm = (): McqForm => ({
  title: "",
  description: "",
  timeLimit: "300",
  visibility: "published",
  paper: "Grammar",
  section: "",
  subject: "English Language 1123",
  level: "O Level",
  year: "Practice",
  questions: [blankQuestion()],
});

type McqManagerProps = {
  initialMcqs?: CmsMcqSet[];
  submissionCounts?: Record<string, number>;
};

type SubmissionStats = {
  counts: Record<string, number>;
  avgScores: Record<string, number>;
};

export function McqManager({ initialMcqs, submissionCounts = {} }: McqManagerProps) {
  const [mcqs, setMcqs] = useState<CmsMcqSet[]>(() => (Array.isArray(initialMcqs) ? initialMcqs : []));
  const [stats, setStats] = useState<SubmissionStats>({
    counts: submissionCounts,
    avgScores: {},
  });
  const [loading, setLoading] = useState(initialMcqs === undefined);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<McqForm>(emptyMcqForm());

  async function loadMcqs() {
    try {
      setLoading(true);
      const [mcqRes, statsRes] = await Promise.all([
        fetch("/api/admin/mcq", { cache: "no-store" }),
        fetch("/api/admin/mcq/counts", { cache: "no-store" }),
      ]);
      const data = mcqRes.ok ? await mcqRes.json() : null;
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setMcqs(Array.isArray(data) ? data : []);
      if (statsData && typeof statsData === "object" && !Array.isArray(statsData)) {
        const s = statsData as Record<string, unknown>;
        setStats({
          counts:
            s.counts && typeof s.counts === "object" && !Array.isArray(s.counts)
              ? (s.counts as Record<string, number>)
              : (statsData as Record<string, number>),
          avgScores:
            s.avgScores && typeof s.avgScores === "object" && !Array.isArray(s.avgScores)
              ? (s.avgScores as Record<string, number>)
              : {},
        });
      }
    } catch {
      setMcqs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMcqs();
  }, []);

  const quizStats = useMemo(() => {
    const list = mcqs ?? [];
    const published = list.filter((mcq) => mcq?.visibility === "published" && !mcq.deleted).length;
    return {
      total: list.length,
      published,
      drafts: list.length - published,
    };
  }, [mcqs]);

  function loadIntoForm(mcq: CmsMcqSet) {
    const q = (mcq?.questions ?? []) as McqQuestion[];
    setForm({
      id: mcq.id,
      title: String(mcq?.title ?? ""),
      description: String(mcq?.description ?? ""),
      timeLimit: mcq?.timeLimit ? String(mcq.timeLimit) : "",
      visibility: (mcq?.visibility === "draft" ? "draft" : "published") as McqForm["visibility"],
      paper: String(mcq?.paper ?? ""),
      section: mcq.section ?? "",
      subject: String(mcq?.subject ?? ""),
      level: String(mcq?.level ?? ""),
      year: String(mcq?.year ?? ""),
      questions: q.length
        ? q.map((question) => ({
            ...question,
            options: { ...question.options },
          }))
        : [blankQuestion()],
    });
  }

  function resetForm() {
    setForm(emptyMcqForm());
  }

  function updateQuestion(index: number, updater: (current: McqQuestion) => McqQuestion) {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, questionIndex) => (questionIndex === index ? updater(question) : question)),
    }));
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!form.questions.length || form.questions.some((question) => !question.question.trim())) {
      toast.error("Each question needs text before saving.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/admin/mcq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        title: form.title,
        description: form.description,
        timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
        visibility: form.visibility,
        paper: form.paper,
        section: form.section || undefined,
        subject: form.subject,
        level: form.level,
        year: form.year,
        questions: form.questions,
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error(data.error ?? "Could not save MCQ set.");
      return;
    }

    toast.success(form.id ? "MCQ set updated." : "MCQ set created.");
    await loadMcqs();
    loadIntoForm(data.mcq);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this MCQ set?");
    if (!confirmed) return;

    const response = await fetch("/api/admin/mcq", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Could not delete MCQ set.");
      return;
    }
    toast.success("MCQ set deleted.");
    if (form.id === id) resetForm();
    await loadMcqs();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">MCQ Builder</h1>
          <p className="mt-1 text-sm text-slate">Create and edit Quick Worksheets with live answer logic and explanations.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Total sets" value={quizStats.total} />
            <StatCard label="Published" value={quizStats.published} />
            <StatCard label="Drafts" value={quizStats.drafts} />
          </div>
          <Button variant="outline" onClick={resetForm} className="mt-4 w-full">
            New MCQ Set
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Existing sets</h2>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-3">
            {loading ? (
              <p className="p-4 text-sm text-slate">Loading MCQs…</p>
            ) : (
              mcqs.map((mcq) => (
                <div key={mcq.id} className="mb-3 rounded-2xl border border-border/60 bg-cream p-4 last:mb-0">
                  <button type="button" className="w-full text-left" onClick={() => loadIntoForm(mcq)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-ink">{mcq.title}</p>
                      {mcq.source === "static" && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                          Built-in
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {(mcq?.questions ?? []).length} questions · {String(mcq?.visibility ?? "")} · {String(mcq?.paper ?? "")}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs font-medium text-crimson">
                      <span>Submissions: {stats.counts[mcq.id] ?? 0}</span>
                      {stats.avgScores[mcq.id] !== undefined && (
                        <span className="text-slate">Avg: {stats.avgScores[mcq.id]}%</span>
                      )}
                    </div>
                  </button>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => loadIntoForm(mcq)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void handleDelete(mcq.id)}>
                      Delete
                    </Button>
                    <Link
                      href={`/resources/view/${mcq.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-white px-3 py-1.5 text-xs font-medium text-slate shadow-sm transition-colors hover:bg-muted hover:text-ink"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Preview
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">
              {form.id ? "Edit MCQ set" : "Create MCQ set"}
            </h2>
            <p className="mt-1 text-sm text-slate">
              Every saved set automatically powers the Quick Worksheets category on the public resources page.
            </p>
          </div>
          <Button onClick={() => void handleSave()} disabled={saving} className="gap-2 shadow-sm">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save MCQ Set"}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </Field>
          <Field label="Time limit (seconds)">
            <Input value={form.timeLimit} onChange={(event) => setForm((prev) => ({ ...prev, timeLimit: event.target.value }))} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Visibility">
            <select
              className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
              value={form.visibility}
              onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value as McqForm["visibility"] }))}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
          <Field label="Paper">
            <Input value={form.paper} onChange={(event) => setForm((prev) => ({ ...prev, paper: event.target.value }))} />
          </Field>
          <Field label="Section">
            <Input value={form.section} onChange={(event) => setForm((prev) => ({ ...prev, section: event.target.value }))} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Subject">
            <Input value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} />
          </Field>
          <Field label="Level">
            <Input value={form.level} onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))} />
          </Field>
          <Field label="Year / session">
            <Input value={form.year} onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </Field>
        </div>

        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold tracking-tight text-ink">Questions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, blankQuestion()] }))}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          {form.questions.map((question, index) => (
            <div key={`${form.id ?? "new"}-${index}`} className="rounded-2xl border border-border/60 bg-cream p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Grip className="h-4 w-4 text-muted-foreground" />
                  Question {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-2xl border border-input bg-white px-3 py-2 text-sm shadow-sm"
                    value={question.section}
                    onChange={(event) =>
                      updateQuestion(index, (current) => ({ ...current, section: event.target.value as McqQuestion["section"] }))
                    }
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                  {form.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          questions: prev.questions.filter((_, questionIndex) => questionIndex !== index),
                        }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="Question text">
                  <Textarea
                    rows={3}
                    value={question.question}
                    onChange={(event) => updateQuestion(index, (current) => ({ ...current, question: event.target.value }))}
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  {(["A", "B", "C", "D"] as McqOption[]).map((optionKey) => (
                    <Field key={optionKey} label={`Option ${optionKey}`}>
                      <Input
                        value={question.options[optionKey]}
                        onChange={(event) =>
                          updateQuestion(index, (current) => ({
                            ...current,
                            options: { ...current.options, [optionKey]: event.target.value },
                          }))
                        }
                      />
                    </Field>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Correct answer">
                    <select
                      className="w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm shadow-sm"
                      value={question.answer}
                      onChange={(event) =>
                        updateQuestion(index, (current) => ({ ...current, answer: event.target.value as McqOption }))
                      }
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </Field>
                  <Field label="Explanation">
                    <Textarea
                      rows={3}
                      value={question.explanation}
                      onChange={(event) =>
                        updateQuestion(index, (current) => ({ ...current, explanation: event.target.value }))
                      }
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-cream p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}
