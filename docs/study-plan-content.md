# Study-plan content: where approved text goes

Status: **DRAFT**. Miss Jaweria's approved month-by-month wording has not been supplied. The pages
show a "Draft plan" notice until it is.

## Insert approved text
File: `src/lib/exam/study-plan.ts`

1. Add months to `PLAN_OVERRIDES`, keyed by syllabus key (`1123`, `0500`, `0510-0511`, `9093-as`,
   `9093-a`) then by `YYYY-MM` (November 2026 to the final paper month, April or May 2027).
   Each month is `{ month, focus, tasks: [{ text, href, worksheetSlot? }] }`; tasks are used in order
   for the weeks of that month. `href` must be an existing public page (a resource-library category
   such as `/resources?cat=topicals`, or `/exam-countdown`). Never link Directed Writing, private LMS
   documents or answer keys.
2. When a syllabus' text is fully approved, set `APPROVED["<key>"] = true`. Only then does its
   "Draft plan" notice disappear. Keep other syllabuses as drafts until they are approved.

## Do not change
- Storage key: `study-plan-v1:<syllabus>` (localStorage).
- Week ids: `<syllabus>:<Monday YYYY-MM-DD>`, starting `2026-11-02`. Ticks are stored against these,
  not against task text, so rewording never loses a student's progress.
- Changing the plan start date or week length would orphan saved ticks.

## Future worksheets
`worksheetSlot` reserves a stable id for a later, curated worksheet assignment. Nothing is generated
at request time. Website MCQ resource ids and the LMS worksheet system stay separate.
