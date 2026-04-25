"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  BookOpen,
  Brain,
  ClipboardList,
  Eye,
  FileSearch,
  FolderOpen,
  LayoutGrid,
  ListChecks,
  FileText,
} from "lucide-react";
import {
  NOTES_HUB_SUBTOPICS,
  RESOURCE_HUB_CATEGORIES,
  resources as defaultResources,
  TOPICALS_PAPER_1_ALWAYS_SECTION_LABELS,
  TOPICALS_PAPER_2_ALWAYS_SECTION_LABELS,
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

/** Hub category is virtual for legacy items: they keep `category: "general-notes"` and `subCategory: "solved-papers"`. */
function resourceBelongsToHubCategory(
  r: Resource,
  cat: ResourceHubCategory
): boolean {
  if (cat === "solved-papers") {
    return r.subCategory === "solved-papers" || r.category === "solved-papers";
  }
  return r.category === cat;
}

const categoryIcon: Record<ResourceHubCategory, typeof BookOpen> = {
  "general-notes": BookOpen,
  topicals: LayoutGrid,
  "yearly-past-papers": FolderOpen,
  "examiner-reports": FileSearch,
  checklists: ClipboardList,
  "quick-worksheets": Brain,
  vocabulary: BookMarked,
  "solved-papers": FileText,
  featured: FolderOpen,
};

const GUIDED_SECTION_CATEGORIES = new Set<ResourceHubCategory>(["topicals", "checklists"]);
const TOPICALS_SECTION_ORDER = [
  "Directed Writing",
  "Composition",
  "Comprehension",
  "Language",
  "Summary",
  "Essay",
  "General Writing",
  "General Reading",
] as const;
const GUIDED_SECTION_ORDER = [
  ...TOPICALS_SECTION_ORDER,
  "Specimen",
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

const ALL_HUB_CATEGORY_IDS = new Set(RESOURCE_HUB_CATEGORIES.map((c) => c.id));

function isResourceHubCategoryId(s: string): s is ResourceHubCategory {
  return ALL_HUB_CATEGORY_IDS.has(s as ResourceHubCategory);
}

function isValidSubForCategory(
  sub: string,
  category: ResourceHubCategory | "all"
): sub is ResourceNotesSubCategory {
  if (category === "general-notes") {
    return NOTES_HUB_SUBTOPICS.some((t) => t.id === sub);
  }
  if (category === "vocabulary") {
    return VOCABULARY_SUBCATEGORY_OPTIONS.some((o) => o.value === sub);
  }
  return false;
}

function readHubFromSearchParams(sp: URLSearchParams) {
  const rawCat = sp.get("cat");
  const category: ResourceHubCategory | "all" =
    rawCat && isResourceHubCategoryId(rawCat) ? rawCat : "all";

  const subRaw = sp.get("sub");
  let notesSubCategory: NotesSubCategoryFilter = "unset";
  if (subRaw && (category === "general-notes" || category === "vocabulary")) {
    if (isValidSubForCategory(subRaw, category)) {
      notesSubCategory = subRaw;
    }
  }

  const paperP = sp.get("paper");
  const paper = paperP && paperP.length > 0 ? paperP : "all";
  const sectionP = sp.get("section");
  const section = sectionP && sectionP.length > 0 ? sectionP : "all";
  return { category, notesSubCategory, paper, section };
}

const selectClass =
  "w-full rounded-2xl border border-input bg-white px-3 py-2.5 text-sm text-ink shadow-[inset_0_1px_1px_rgba(34,16,18,0.03)] transition-[background-color,border-color,box-shadow] duration-200 ease-out focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25";

type NotesSubCategoryFilter = "unset" | ResourceNotesSubCategory;

const NOTES_SUBCATEGORY_OPTIONS = NOTES_HUB_SUBTOPICS.map((t) => ({ value: t.id, label: t.label }));
const NOTES_TOPIC_BLOCKS = NOTES_HUB_SUBTOPICS;

const VOCABULARY_TOPIC_BLOCKS: { id: ResourceNotesSubCategory; label: string; description: string }[] = [
  { id: "comprehension-vocabulary", label: "Comprehension Vocabulary", description: "Words and phrases for reading and comprehension tasks." },
  { id: "essay-vocabulary", label: "Essay Vocabulary", description: "Expressive vocabulary for writing tasks." },
  { id: "directed-writing-vocabulary", label: "Directed Writing Vocabulary", description: "High-impact vocabulary and phrases for directed writing." },
  { id: "summary-writing-vocabulary", label: "Summary Writing Vocabulary", description: "High-utility vocabulary for summary writing tasks." },
  { id: "general-vocabulary", label: "General Vocabulary", description: "Broad vocabulary banks for all paper tasks." },
  { id: "p2-50-words", label: "50 Words for P2", description: "High-impact bank for Paper 2 directed writing and essays." },
];

const VOCABULARY_SUBCATEGORY_OPTIONS: { value: ResourceNotesSubCategory; label: string }[] = [
  { value: "comprehension-vocabulary", label: "Comprehension Vocabulary" },
  { value: "essay-vocabulary", label: "Essay Vocabulary" },
  { value: "directed-writing-vocabulary", label: "Directed Writing Vocabulary" },
  { value: "summary-writing-vocabulary", label: "Summary Writing Vocabulary" },
  { value: "general-vocabulary", label: "General Vocabulary" },
  { value: "p2-50-words", label: "50 Words for P2" },
];

const NOTES_TOPIC_ACCENTS: Record<string, { gradient: string; border: string }> = {
  "summary-writing":    { gradient: "to-rose-200/40",  border: "border-rose-300/50" },
  comprehension:        { gradient: "to-red-300/40",   border: "border-red-300/50"  },
  "essay-writing":      { gradient: "to-pink-300/40",  border: "border-pink-300/50" },
  "directed-writing":   { gradient: "to-rose-300/40",  border: "border-rose-300/50" },
  grammar:              { gradient: "to-pink-200/40",  border: "border-pink-300/50" },
};

const topicBrowseCardClass = (active: boolean, topicId?: string) => {
  const accent = topicId ? NOTES_TOPIC_ACCENTS[topicId] : undefined;
  return cn(
    "origin-center rounded-2xl border-2 bg-gradient-to-br from-white via-white p-5 text-left",
    "shadow-[0_10px_30px_rgba(112,20,20,0.08)]",
    "transition-all duration-300 ease-out",
    "hover:-translate-y-[2px] hover:border-primary/60 hover:shadow-[0_12px_40px_rgba(112,20,20,0.12)]",
    "motion-reduce:hover:translate-y-0",
    accent?.gradient ?? "to-rose-100/40",
    accent?.border   ?? "border-border/50",
    active && "border-primary/60 ring-1 ring-primary/20",
  );
};

const pdfResourceSurfaceClass = cn(
  "flex flex-col rounded-2xl border border-[#fdba74] bg-[#fff7ed] p-6 shadow-sm",
  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
  "hover:-translate-y-0.5 hover:shadow-xl motion-reduce:hover:translate-y-0"
);

const PDE_EXPLAINED_ID = "notes-pde-explained";

const pdeExplainedHighlightSurfaceClass = cn(
  "flex flex-col rounded-2xl border border-border/70 bg-gradient-to-r from-[#fff7ed] to-white p-6 shadow-sm",
  "border-l-4 !border-l-[#ea580c]",
  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
  "hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0"
);

const defaultCategoryButtonClass = cn(
  "rounded-2xl border border-border/70 bg-white p-5 text-left shadow-sm",
  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
  "hover:-translate-y-0.5 hover:border-border hover:shadow-md motion-reduce:hover:translate-y-0"
);

/** Solved Papers: same borders/shadows/spacing as hub categories; soft gradient + left accent; hover flattens to light warm tint. */
const solvedPapersCategoryButtonClass = cn(
  defaultCategoryButtonClass,
  "bg-gradient-to-r from-[#fff7ed] to-white hover:bg-none hover:bg-[#fff7ed]",
  "border-l-4 !border-l-[#ea580c] hover:!border-l-[#ea580c]"
);

const previewPillClass = (active: boolean) =>
  cn(
    "rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-md motion-reduce:hover:translate-y-0",
    active ? "border-primary/35 ring-1 ring-primary/20" : "border-border/70"
  );

function sortSections(values: string[]) {
  return [...values].sort((a, b) => {
    const ai = GUIDED_SECTION_ORDER.indexOf(a as (typeof GUIDED_SECTION_ORDER)[number]);
    const bi = GUIDED_SECTION_ORDER.indexOf(b as (typeof GUIDED_SECTION_ORDER)[number]);
    const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    return av === bv ? a.localeCompare(b) : av - bv;
  });
}

/** Paper 2 Topicals: fixed hub order only (Essay, then Directed Writing). */
function sortTopicalSectionsForPaper2(sections: string[]) {
  const order = [...TOPICALS_PAPER_2_ALWAYS_SECTION_LABELS];
  return [...sections].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    return av === bv ? a.localeCompare(b) : av - bv;
  });
}

export function ResourcesHub({ resources = defaultResources }: { resources?: Resource[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const spKey = searchParams.toString();
  const { category, notesSubCategory, paper, section } = useMemo(
    () => readHubFromSearchParams(new URLSearchParams(spKey)),
    [spKey]
  );

  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState("all");
  const [year, setYear] = useState("all");

  const writeHub = useCallback(
    (h: {
      category: ResourceHubCategory | "all";
      notesSubCategory: NotesSubCategoryFilter;
      paper: string;
      section: string;
    }) => {
      const p = new URLSearchParams(searchParams.toString());
      if (h.category === "all") p.delete("cat");
      else p.set("cat", h.category);
      if (h.notesSubCategory === "unset" || (h.category !== "general-notes" && h.category !== "vocabulary")) {
        p.delete("sub");
      } else {
        p.set("sub", h.notesSubCategory);
      }
      if (h.paper === "all") p.delete("paper");
      else p.set("paper", h.paper);
      if (h.section === "all") p.delete("section");
      else p.set("section", h.section);
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

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

  const safeResources = useMemo(
    () =>
      (resources ?? []).filter(
        (resource) =>
          Boolean(resource) &&
          (resource.type === "mcq" ||
            (typeof resource.fileUrl === "string" && resource.fileUrl.startsWith("/resources/")))
      ),
    [resources]
  );

  const scopedForFilters = useMemo(() => {
    if (category === "all") return safeResources;
    return safeResources.filter((r) => resourceBelongsToHubCategory(r, category));
  }, [category, safeResources]);

  const scopedForResults = useMemo(() => {
    if (category === "all") return [];
    return safeResources.filter((r) => resourceBelongsToHubCategory(r, category));
  }, [category, safeResources]);
  const guidedPreviewResources = useMemo(() => {
    if (!GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory)) return [];
    return scopedForFilters.filter((r) => {
      if (subject !== "all" && r.subject !== subject) return false;
      if (level !== "all" && r.level !== level) return false;
      if (year !== "all" && r.year !== year) return false;
      return true;
    });
  }, [category, scopedForFilters, subject, level, year]);

  const subjectOptions = useMemo(() => uniqueSorted(scopedForFilters.map((r) => r.subject)), [scopedForFilters]);
  const levelOptions = useMemo(() => uniqueSorted(scopedForFilters.map((r) => r.level)), [scopedForFilters]);
  const yearOptions = useMemo(() => uniqueSorted(scopedForFilters.map((r) => r.year)), [scopedForFilters]);
  const paperOptions = useMemo(() => {
    if (category === "topicals") {
      return ["Paper 1", "Paper 2"];
    }
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

    if (paper === "Paper 2") {
      return sortTopicalSectionsForPaper2([...TOPICALS_PAPER_2_ALWAYS_SECTION_LABELS]);
    }

    if (paper === "Paper 1") {
      return sortSections([...TOPICALS_PAPER_1_ALWAYS_SECTION_LABELS]);
    }

    return [];
  }, [category, paper, scopedForFilters]);

  const guidedPaperSections = useMemo(() => {
    if (!GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory)) return [];
    return ["Paper 1", "Paper 2"]
      .map((paperName) => {
        const fromResources = Array.from(
          new Set(
            guidedPreviewResources
              .filter((r) => r.paper === paperName)
              .map((r) => r.section)
              .filter((value): value is string => Boolean(value))
          )
        );
        const sections =
          category === "topicals" && paperName === "Paper 2"
            ? sortTopicalSectionsForPaper2([...TOPICALS_PAPER_2_ALWAYS_SECTION_LABELS])
            : category === "topicals" && paperName === "Paper 1"
              ? sortSections([...TOPICALS_PAPER_1_ALWAYS_SECTION_LABELS])
              : sortSections(fromResources);
        return { paper: paperName, sections };
      })
      .filter((entry) => (category === "topicals" ? true : entry.sections.length > 0));
  }, [category, guidedPreviewResources]);

  function selectCategory(next: ResourceHubCategory | "all") {
    setSubject("all");
    setLevel("all");
    setYear("all");
    writeHub({ category: next, notesSubCategory: "unset", paper: "all", section: "all" });
  }

  function openCategory(next: ResourceHubCategory) {
    selectCategory(next);
    requestAnimationFrame(() => scrollToResourceGrid());
  }

  function handleTopicTileClick(id: ResourceNotesSubCategory) {
    if (topicTapTimeoutRef.current) clearTimeout(topicTapTimeoutRef.current);
    setTopicTapId(id);
    writeHub({ category, notesSubCategory: id, paper, section });
    requestAnimationFrame(() => scrollToResourceGrid());
    topicTapTimeoutRef.current = setTimeout(() => {
      setTopicTapId(null);
      topicTapTimeoutRef.current = null;
    }, 200);
  }

  const filtered = useMemo(() => {
    if (category === "all") return [];

    const filteredResources = safeResources.filter((r) => {
      if (category !== "topicals") return true;
      if (r.category !== "topicals") return false;
      if (paper === "all") return false;
      if (r.paper !== paper) return false;
      if (section === "all") return true;
      if (r.section !== section) return false;
      return true;
    });

    const basePool = category === "topicals" ? filteredResources : scopedForResults;

    const matched = basePool.filter((r) => {
      if (category === "general-notes" || category === "vocabulary") {
        if (notesSubCategory === "unset") return false;
        if (r.subCategory !== notesSubCategory) return false;
      }

      if (category === "topicals") {
        if (paper === "all") return false;
        if (r.paper !== paper) return false;
        if (section !== "all" && r.section !== section) return false;
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

    if (category === "general-notes" && notesSubCategory === "directed-writing") {
      return [...matched].sort((a, b) => {
        if (a.id === PDE_EXPLAINED_ID) return -1;
        if (b.id === PDE_EXPLAINED_ID) return 1;
        return 0;
      });
    }

    return matched;
  }, [category, scopedForResults, notesSubCategory, paper, section, subject, level, year, safeResources]);

  const paperResources = useMemo(() => {
    if (category !== "topicals" || paper === "all") return [];
    return safeResources.filter((r) => r.category === "topicals" && r.paper === paper);
  }, [category, paper, safeResources]);

  const isEmpty = !paperResources || paperResources.length === 0;

  function resetFilters() {
    selectCategory("all");
  }

  let emptyState = "";
  if (category === "general-notes" && notesSubCategory === "unset") {
    emptyState = "Choose a notes topic above to see the files in that area.";
  } else if (category === "vocabulary" && notesSubCategory === "unset") {
    emptyState = "Choose a vocabulary topic above to see the files in that area.";
  } else if (GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) && paper === "all") {
    emptyState = "Choose a paper to begin targeted practice.";
  } else if (GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) && section === "all" && category !== "topicals") {
    emptyState = "Select a section to see the matching files.";
  } else if (category !== "all") {
    emptyState = "No resources match these filters.";
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:mb-14 sm:p-8">
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
                  className="rounded-2xl border border-border/60 bg-white p-6 text-left shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-md motion-reduce:hover:translate-y-0"
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

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:mb-14 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => selectCategory("all")}
            className={cn(
              "rounded-2xl border bg-white p-5 text-left shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-md motion-reduce:hover:translate-y-0",
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
            const isSolved = cat.id === "solved-papers";
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  isSolved ? solvedPapersCategoryButtonClass : defaultCategoryButtonClass,
                  active && "border-primary/35 ring-1 ring-primary/20"
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
          <div className="mb-12 rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:mb-14 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
              Browse Notes by Topic
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
              Pick one topic to focus your notes before opening the file list.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NOTES_TOPIC_BLOCKS.map((topic) => {
                const active = notesSubCategory === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicTileClick(topic.id)}
                    className={cn(
                      topicBrowseCardClass(active, topic.id),
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

        {category === "vocabulary" && (
          <div className="mb-12 rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:mb-14 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
              Browse Vocabulary by Type
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
              Pick a vocabulary type to open the matching files.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {VOCABULARY_TOPIC_BLOCKS.map((topic) => {
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
                    <p className="mt-1.5 text-xs leading-relaxed text-slate">{topic.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {category !== "all" && (
          <div
            id="resource-filters"
            className="mb-12 rounded-2xl border border-border/60 bg-white p-5 shadow-sm sm:mb-14 sm:p-6"
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    const p = e.target.value;
                    writeHub({ category, notesSubCategory, paper: p, section: "all" });
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
                  <select
                    className={selectClass}
                    value={section}
                    onChange={(e) => {
                      const s = e.target.value;
                      writeHub({ category, notesSubCategory, paper, section: s });
                    }}
                  >
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
                    onChange={(e) => {
                      const v = e.target.value as NotesSubCategoryFilter;
                      writeHub({ category, notesSubCategory: v, paper, section });
                    }}
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
            {category === "vocabulary" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:max-w-xs">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate">Vocabulary focus</span>
                  <select
                    className={selectClass}
                    value={notesSubCategory}
                    onChange={(e) => {
                      const v = e.target.value as ResourceNotesSubCategory;
                      writeHub({ category, notesSubCategory: v, paper, section });
                    }}
                  >
                    <option value="unset">Choose a type</option>
                    {VOCABULARY_SUBCATEGORY_OPTIONS.map((opt) => (
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
                {category === "topicals"
                  ? "Choose a paper to view its topicals. Use the section filter to narrow when you are ready."
                  : "Complete both steps before files appear."}
              </p>
            )}
          </div>
        )}

        <div id="resource-grid" className="scroll-mt-24 sm:scroll-mt-28">
          {!safeResources.length ? (
            <div className="rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm sm:p-8">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
                No resources available yet. Please refresh.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                If this message persists, try refreshing the page.
              </p>
            </div>
          ) : category === "all" ? (
            <div className="py-10 text-center sm:py-14">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
                Explore Resources
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Choose a category to begin your preparation.
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : category === "topicals" && paper !== "all" && isEmpty ? (
            <div className="rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm sm:p-8">
              <p className="text-sm leading-relaxed text-slate">
                No resources available for this paper yet. Please check back soon.
              </p>
              {paper === "Paper 2" && (
                <p className="mt-2 text-xs text-muted-foreground">Paper 2 resources will be added soon.</p>
              )}
            </div>
          ) : GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) && paper === "all" ? (
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-center text-sm leading-relaxed text-slate">{emptyState}</p>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {guidedPaperSections.map((paperEntry) => (
                  <div key={paperEntry.paper} className="space-y-3">
                    <h3 className="font-serif text-lg font-semibold text-ink">{paperEntry.paper}</h3>
                    <div className="grid gap-4">
                      {paperEntry.sections.map((sectionName) => {
                        const count = guidedPreviewResources.filter(
                          (r) => r.paper === paperEntry.paper && r.section === sectionName
                        ).length;
                        return (
                          <button
                            key={`${paperEntry.paper}-${sectionName}`}
                            type="button"
                            onClick={() => {
                              writeHub({
                                category,
                                notesSubCategory,
                                paper: paperEntry.paper,
                                section: sectionName,
                              });
                              requestAnimationFrame(() => scrollToResourceGrid());
                            }}
                            className={previewPillClass(false)}
                          >
                            <p className="font-serif text-sm font-semibold text-ink">{sectionName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{count} resources</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : GUIDED_SECTION_CATEGORIES.has(category as ResourceHubCategory) &&
            section === "all" &&
            !(category === "topicals" && paper !== "all") ? (
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-center text-sm leading-relaxed text-slate">Select a section to continue.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sectionOptions.map((sectionName) => {
                  const count = guidedPreviewResources.filter(
                    (r) => r.paper === paper && r.section === sectionName
                  ).length;
                  return (
                    <button
                      key={`${paper}-${sectionName}`}
                      type="button"
                      onClick={() => {
                        writeHub({ category, notesSubCategory, paper, section: sectionName });
                        requestAnimationFrame(() => scrollToResourceGrid());
                      }}
                      className={previewPillClass(section === sectionName)}
                    >
                      <p className="font-serif text-sm font-semibold text-ink">{sectionName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{count} resources</p>
                    </button>
                  );
                })}
              </div>
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
  const isPdfResource = !isMcq;
  const vaultChip = isScripts ? scriptsResourceVaultChip(resource.title, displayTitle) : null;
  const { main: titleMain, secondary: titleSecondary } = isScripts
    ? splitScriptsCardTitle(displayTitle)
    : { main: displayTitle, secondary: null as string | null };

  const isPdeExplained = resource.id === PDE_EXPLAINED_ID;

  return (
    <article
      className={cn(
        isPdfResource
          ? isPdeExplained
            ? pdeExplainedHighlightSurfaceClass
            : pdfResourceSurfaceClass
          : "flex flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:shadow-md motion-reduce:hover:translate-y-0"
      )}
    >
      {isMcq && <span className={scriptsChipClass}>MCQ Assessment</span>}
      {vaultChip && !isMcq && <span className={scriptsChipClass}>{vaultChip}</span>}
      <h3 className="font-serif text-base font-semibold leading-relaxed tracking-tight text-ink">{titleMain}</h3>
      {isScripts && titleSecondary ? (
        <p className="mt-1 text-xs font-medium tabular-nums tracking-wide text-slate">{titleSecondary}</p>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{meta}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate sm:text-base">{resource.description}</p>
      <div className="mt-6">
        {isMcq ? (
          <Link
            href={`/resources/view/${resource.id}`}
            onClick={() =>
              trackResourceView(resource.id, displayTitle, { interaction: "hub_listing" })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            <Eye className="h-4 w-4 shrink-0" aria-hidden />
            Open PDF
          </Link>
        )}
      </div>
    </article>
  );
}
