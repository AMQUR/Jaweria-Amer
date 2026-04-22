"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardList,
  Eye,
  FileSearch,
  FolderOpen,
  LayoutGrid,
  ListChecks,
} from "lucide-react";
import {
  RESOURCE_HUB_CATEGORIES,
  resources,
  type Resource,
  type ResourceHubCategory,
  type ResourceNotesSubCategory,
} from "@/lib/data";
import { trackResourceView } from "@/lib/analytics";
import {
  formatDisplayTitle,
  scriptsResourceVaultChip,
  splitScriptsCardTitle,
} from "@/lib/resource-ingestion";
import { cn } from "@/lib/utils";

const categoryIcon: Record<ResourceHubCategory, typeof BookOpen> = {
  "general-notes": BookOpen,
  topicals: LayoutGrid,
  "yearly-past-papers": FolderOpen,
  "examiner-reports": FileSearch,
  checklists: ClipboardList,
  "quick-worksheets": Brain,
};

const GUIDED_SECTION_CATEGORIES = new Set<ResourceHubCategory>(["topicals", "checklists"]);
const TOPICALS_SECTION_ORDER = [
  "Directed Writing",
  "Composition",
  "Comprehension",
  "Language",
  "Summary",
  "General Writing",
  "General Reading",
] as const;

const START_PATHWAYS: {
  id: string;
  title: string;
  description: string;
  category: ResourceHubCategory;
  cta: string;
  icon: typeof BookOpen;
}[] = [
  {
    id: "foundation",
    title: "Build Your Foundation",
    description: "Start with topic-based notes before moving into practice.",
    category: "general-notes",
    cta: "Open Notes",
    icon: BookOpen,
  },
  {
    id: "yearlies",
    title: "Practice with Real Papers",
    description: "Work through official yearlies in a cleaner session-based list.",
    category: "yearly-past-papers",
    cta: "Open Yearlies",
    icon: FolderOpen,
  },
  {
    id: "mcqs",
    title: "Test Yourself",
    description: "Use quick MCQs for fast checks on grammar, punctuation, and accuracy.",
    category: "quick-worksheets",
    cta: "Open MCQs",
    icon: Brain,
  },
];

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

const selectClass =
  "w-full rounded-xl border border-input bg-white px-3 py-2.5 text-sm text-ink shadow-[inset_0_1px_1px_rgba(34,16,18,0.03)] transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

type NotesSubCategoryFilter = "unset" | ResourceNotesSubCategory;

const NOTES_SUBCATEGORY_OPTIONS: { value: ResourceNotesSubCategory; label: string }[] = [
  { value: "summary-writing", label: "Summary Writing" },
  { value: "comprehension", label: "Comprehension" },
  { value: "essay-writing", label: "Essay Writing" },
  { value: "directed-writing", label: "Directed Writing" },
  { value: "grammar", label: "Grammar" },
];

const NOTES_TOPIC_BLOCKS: { id: ResourceNotesSubCategory; label: string }[] = [
  { id: "summary-writing", label: "Summary Writing" },
  { id: "comprehension", label: "Comprehension" },
  { id: "essay-writing", label: "Essay Writing" },
  { id: "directed-writing", label: "Directed Writing" },
  { id: "grammar", label: "Grammar" },
];

const topicBrowseCardClass = (active: boolean) =>
  cn(
    "origin-center rounded-xl border bg-white p-5 text-left shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:border-border hover:shadow-[0_4px_18px_rgba(34,16,18,0.06)]",
    active ? "border-primary/35 ring-1 ring-primary/20" : "border-border/70"
  );

export function ResourcesHub() {
  const [category, setCategory] = useState<ResourceHubCategory | "all">("all");
  const [notesSubCategory, setNotesSubCategory] = useState<NotesSubCategoryFilter>("unset");
  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState("all");
  const [paper, setPaper] = useState("all");
  const [year, setYear] = useState("all");
  const [section, setSection] = useState("all");

  const scrollToResourceGrid = useCallback(() => {
    document.getElementById("resource-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const topicTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [topicTapId, setTopicTapId] = useState<ResourceNotesSubCategory | null>(null);

  useEffect(() => {
    return () => {
      if (topicTapTimeoutRef.current) clearTimeout(topicTapTimeoutRef.current);
    };
  }, []);

  const scopedForFilters = useMemo(
    () => (category === "all" ? resources : resources.filter((r) => r.category === category)),
    [category]
  );

  const scopedForResults = useMemo(
    () => (category === "all" ? [] : resources.filter((r) => r.category === category)),
    [category]
  );

  const subjectOptions = useMemo(() => uniqueSorted(scopedForFilters.map((r) => r.subject)), [scopedForFilters]);
  const levelOptions = useMemo(() => uniqueSorted(scopedForFilters.map((r) => r.level)), [scopedForFilters]);
  const yearOptions = useMemo(() => uniqueSorted(scopedForFilters.map((r) => r.year)), [scopedForFilters]);
  const paperOptions = useMemo(() => {
    const values = uniqueSorted(scopedForFilters.map((r) => r.paper));
    return GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory)
      ? values.filter((value) => value === "Paper 1" || value === "Paper 2")
      : values;
  }, [category, scopedForFilters]);
  const sectionOptions = useMemo(() => {
    if (category !== "topicals" || paper === "all") {
      if (!GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) || paper === "all") return [];
      return uniqueSorted(
        scopedForFilters
          .filter((r) => r.paper === paper)
          .map((r) => r.section ?? "")
          .filter(Boolean)
      );
    }

    const sections = Array.from(
      new Set(
        resources
          .filter((r) => r.category === "topicals" && r.paper === paper)
          .map((r) => r.section)
          .filter((section): section is string => Boolean(section))
      )
    );

    return [...sections].sort((a, b) => {
      const ai = TOPICALS_SECTION_ORDER.indexOf(a as (typeof TOPICALS_SECTION_ORDER)[number]);
      const bi = TOPICALS_SECTION_ORDER.indexOf(b as (typeof TOPICALS_SECTION_ORDER)[number]);
      const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
      const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
      return av === bv ? a.localeCompare(b) : av - bv;
    });
  }, [category, paper, scopedForFilters]);

  function selectCategory(next: ResourceHubCategory | "all") {
    setCategory(next);
    setNotesSubCategory("unset");
    setSubject("all");
    setLevel("all");
    setPaper("all");
    setYear("all");
    setSection("all");
  }

  function openCategory(next: ResourceHubCategory) {
    selectCategory(next);
    requestAnimationFrame(() => scrollToResourceGrid());
  }

  function handleTopicTileClick(id: ResourceNotesSubCategory) {
    if (topicTapTimeoutRef.current) clearTimeout(topicTapTimeoutRef.current);
    setTopicTapId(id);
    setNotesSubCategory(id);
    requestAnimationFrame(() => scrollToResourceGrid());
    topicTapTimeoutRef.current = setTimeout(() => {
      setTopicTapId(null);
      topicTapTimeoutRef.current = null;
    }, 200);
  }

  const filtered = useMemo(() => {
    if (category === "all") return [];

    const filteredResources = resources.filter((r) => {
      if (category !== "topicals") return true;
      if (r.category !== "topicals") return false;
      if (paper === "all") return false;
      if (r.paper !== paper) return false;
      if (section === "all") return false;
      if (r.section !== section) return false;
      return true;
    });

    const basePool = category === "topicals" ? filteredResources : scopedForResults;

    return basePool.filter((r) => {
      if (category === "general-notes") {
        if (notesSubCategory === "unset") return false;
        if (r.subCategory !== notesSubCategory) return false;
      }

      if (category === "topicals") {
        return true;
      }

      if (GUIDED_SECTION_CATEGORIES.has(category)) {
        if (paper === "all" || r.paper !== paper) return false;
        if (section === "all" || r.section !== section) return false;
      } else if (paper !== "all" && r.paper !== paper) {
        return false;
      }

      if (subject !== "all" && r.subject !== subject) return false;
      if (level !== "all" && r.level !== level) return false;
      if (year !== "all" && r.year !== year) return false;
      return true;
    });
  }, [category, scopedForResults, notesSubCategory, paper, section, subject, level, year]);

  function resetFilters() {
    selectCategory("all");
  }

  let emptyState = "Choose a category above to start exploring resources.";
  if (category === "general-notes" && notesSubCategory === "unset") {
    emptyState = "Choose a notes topic above to see the files in that area.";
  } else if (GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) && paper === "all") {
    emptyState = "Select Paper 1 or Paper 2 to continue.";
  } else if (GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) && section === "all") {
    emptyState = "Select a section to see the matching files.";
  } else if (category !== "all") {
    emptyState = "No resources match these filters.";
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-2xl border border-border/70 bg-white p-6 shadow-[0_1px_3px_rgba(34,16,18,0.04)] sm:mb-14 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
            Start Your Preparation
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
            Choose a path based on what you want to improve.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {START_PATHWAYS.map((pathway) => {
              const Icon = pathway.icon;
              return (
                <button
                  key={pathway.id}
                  type="button"
                  onClick={() => openCategory(pathway.category)}
                  className="rounded-xl border border-border/70 bg-white p-6 text-left shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-border hover:shadow-[0_6px_22px_rgba(34,16,18,0.07)]"
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-brand">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-serif text-base font-semibold leading-snug text-ink">{pathway.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">{pathway.description}</p>
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-brand">
                    {pathway.cta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:mb-14 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => selectCategory("all")}
            className={cn(
              "rounded-xl border bg-white p-5 text-left shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-all hover:border-border hover:shadow-[0_4px_18px_rgba(34,16,18,0.06)]",
              category === "all" ? "border-primary/35 ring-1 ring-primary/20" : "border-border/70"
            )}
          >
            <p className="font-serif text-sm font-semibold text-ink">All</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate">
              Pick a category to unlock guided navigation.
            </p>
          </button>
          {RESOURCE_HUB_CATEGORIES.map((cat) => {
            const Icon = categoryIcon[cat.id];
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "rounded-xl border bg-white p-5 text-left shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-all hover:border-border hover:shadow-[0_4px_18px_rgba(34,16,18,0.06)]",
                  active ? "border-primary/35 ring-1 ring-primary/20" : "border-border/70"
                )}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-brand">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-serif text-sm font-semibold text-ink">{cat.label}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate">{cat.blurb}</p>
              </button>
            );
          })}
        </div>

        {category === "general-notes" && (
          <div className="mb-12 rounded-2xl border border-border/70 bg-white p-6 shadow-[0_1px_3px_rgba(34,16,18,0.04)] sm:mb-14 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
              Browse Notes by Topic
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
              Pick one topic to focus your notes before opening the file list.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {NOTES_TOPIC_BLOCKS.map((topic) => {
                const active = notesSubCategory === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicTileClick(topic.id)}
                    className={cn(
                      topicBrowseCardClass(active),
                      topicTapId === topic.id && "resource-topic-tap-active"
                    )}
                  >
                    <p className="font-serif text-sm font-semibold text-ink">{topic.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate">View notes in this area.</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          id="resource-filters"
          className="mb-12 rounded-xl border border-border/70 bg-white p-5 shadow-[0_1px_3px_rgba(34,16,18,0.04)] sm:mb-14 sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Refine</p>
              <h2 className="mt-1 font-serif text-lg font-semibold text-ink">Filters</h2>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="self-start text-xs font-medium text-slate underline-offset-4 transition-colors hover:text-ink sm:self-auto"
            >
              Reset all
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate">Subject</span>
              <select className={selectClass} value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="all">All subjects</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate">Level</span>
              <select className={selectClass} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="all">All levels</option>
                {levelOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate">
                {GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) ? "Step 1: Paper" : "Paper"}
              </span>
              <select
                className={selectClass}
                value={paper}
                onChange={(e) => {
                  setPaper(e.target.value);
                  setSection("all");
                }}
              >
                <option value="all">
                  {GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory)
                    ? "Select a paper"
                    : "All papers"}
                </option>
                {paperOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate">
                {GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) ? "Step 2: Section" : "Year"}
              </span>
              {GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) ? (
                <select className={selectClass} value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="all">Select a section</option>
                  {sectionOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <select className={selectClass} value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="all">All years</option>
                  {yearOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
          {category === "general-notes" && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:max-w-xs">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate">Note focus</span>
                <select
                  className={selectClass}
                  value={notesSubCategory}
                  onChange={(e) => setNotesSubCategory(e.target.value as NotesSubCategoryFilter)}
                >
                  <option value="unset">Choose a topic</option>
                  {NOTES_SUBCATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) && (
            <p className="mt-3 text-xs leading-relaxed text-slate">
              Complete both steps before files appear.
            </p>
          )}
        </div>

        <div id="resource-grid" className="scroll-mt-24 sm:scroll-mt-28">
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate">{emptyState}</p>
          )}
        </div>
      </div>
    </section>
  );
}

const scriptsChipClass =
  "mb-2 inline-flex w-fit rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground";

function ResourceCard({ resource }: { resource: Resource }) {
  const meta = [resource.level, resource.subject, resource.section, resource.year, resource.paper]
    .filter(Boolean)
    .join(" · ");
  const displayTitle = formatDisplayTitle(resource.title, resource.category);
  const isScripts = resource.category === "examiner-reports";
  const isMcq = resource.type === "mcq";
  const vaultChip = isScripts ? scriptsResourceVaultChip(resource.title, displayTitle) : null;
  const { main: titleMain, secondary: titleSecondary } = isScripts
    ? splitScriptsCardTitle(displayTitle)
    : { main: displayTitle, secondary: null as string | null };

  return (
    <article className="flex flex-col rounded-xl border border-border/70 bg-white p-6 shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-border hover:shadow-[0_6px_22px_rgba(34,16,18,0.07)]">
      {isMcq && <span className={scriptsChipClass}>MCQ Assessment</span>}
      {vaultChip && !isMcq && <span className={scriptsChipClass}>{vaultChip}</span>}
      <h3 className="font-serif text-base font-semibold leading-snug text-ink">{titleMain}</h3>
      {isScripts && titleSecondary ? (
        <p className="mt-1 text-xs font-medium tabular-nums tracking-wide text-slate">{titleSecondary}</p>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-slate">{meta}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">{resource.description}</p>
      <div className="mt-6">
        {isMcq ? (
          <Link
            href={`/resources/view/${resource.id}`}
            onClick={() =>
              trackResourceView(resource.id, displayTitle, { interaction: "hub_listing" })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgba(34,16,18,0.08)] transition-all hover:bg-brand-accent hover:shadow-[0_4px_14px_rgba(112,20,20,0.15)]"
          >
            <ListChecks className="h-4 w-4 shrink-0" aria-hidden />
            Take Assessment
          </Link>
        ) : (
          <Link
            href={`/resources/view/${resource.id}`}
            onClick={() =>
              trackResourceView(resource.id, displayTitle, { interaction: "hub_listing" })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-[0_1px_2px_rgba(34,16,18,0.08)] transition-all hover:bg-brand-accent hover:shadow-[0_4px_14px_rgba(112,20,20,0.15)]"
          >
            <Eye className="h-4 w-4 shrink-0" aria-hidden />
            View Resource
          </Link>
        )}
      </div>
    </article>
  );
}
