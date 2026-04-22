import type { McqQuestion } from "@/lib/mcq-data";
import type { ResourceHubCategory, ResourceNotesSubCategory } from "@/lib/data";

export type CmsResourceCategory = ResourceHubCategory;
export type CmsResourceVisibility = "published" | "draft";
export type CmsResourceType = "pdf" | "mcq";
export type CmsResourceSource = "static" | "admin";

export const CMS_RESOURCE_CATEGORY_LABELS: Record<CmsResourceCategory, string> = {
  "general-notes": "Notes",
  topicals: "Topicals",
  "yearly-past-papers": "Yearlies",
  "examiner-reports": "Scripts",
  checklists: "Marking Schemes",
  "quick-worksheets": "Quick Worksheets — MCQs",
};

export const CMS_RESOURCE_CATEGORY_OPTIONS: { value: CmsResourceCategory; label: string }[] = [
  { value: "general-notes", label: "Notes" },
  { value: "topicals", label: "Topicals" },
  { value: "yearly-past-papers", label: "Yearlies" },
  { value: "examiner-reports", label: "Scripts" },
  { value: "checklists", label: "Marking Schemes" },
  { value: "quick-worksheets", label: "Quick Worksheets — MCQs" },
];

export const CMS_NOTES_SUBCATEGORY_OPTIONS: {
  value: ResourceNotesSubCategory;
  label: string;
}[] = [
  { value: "summary-writing", label: "Summary Writing" },
  { value: "comprehension", label: "Comprehension" },
  { value: "essay-writing", label: "Essay Writing" },
  { value: "directed-writing", label: "Directed Writing" },
  { value: "grammar", label: "Grammar" },
];

export const CMS_PAPER_OPTIONS = ["Paper 1", "Paper 2"] as const;

export const CMS_SECTION_OPTIONS = [
  "Directed Writing",
  "Composition",
  "Comprehension",
  "Language",
  "Summary",
  "General Writing",
  "General Reading",
  "Question 1",
  "Question 2",
  "Question 3",
  "General",
  "Specimen",
] as const;

export interface CmsResourceRecord {
  id: string;
  title: string;
  category: CmsResourceCategory;
  subCategory?: ResourceNotesSubCategory;
  paper: string;
  section?: string;
  fileUrl: string;
  type: CmsResourceType;
  visibility: CmsResourceVisibility;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  subject: string;
  level: string;
  year: string;
  description: string;
  source: CmsResourceSource;
  deleted?: boolean;
  autoDetectSection?: boolean;
}

export interface CmsMcqSet {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  questions: McqQuestion[];
  visibility: CmsResourceVisibility;
  paper: string;
  section?: string;
  subject: string;
  level: string;
  year: string;
  createdAt: string;
  updatedAt: string;
  source: CmsResourceSource;
  deleted?: boolean;
}

export interface HomepageContent {
  heroKicker: string;
  heroTitlePrimary: string;
  heroTitleSecondary: string;
  heroDescription: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  bannerImagePath: string;
  updatedAt: string;
}

export interface UploadAsset {
  path: string;
  url: string;
  fileName: string;
  size: number;
  updatedAt: string;
  category: string;
}
