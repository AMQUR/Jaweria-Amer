# M/J 2026 Results — methodology, consent and publication rules (jaweriaamer.com)

**Source of truth:** Google Form export "English With Miss Jay M/J 26 Results (Responses)" (Drive file `1zsNGRQ8r45xOTRd1pRHNpSIj0YqTqDgC7gfIUi0flfo`), exported as CSV on 2026-09-02 and cross-checked cell-for-cell against the attached `.xlsx` export of the same sheet. The raw export is PII and lives only in the git-ignored `scripts/source/`. Everything public is produced by `scripts/results/build-mj26-results.ts` (pure logic in `src/lib/results/mj26-pipeline.ts`, tests in `scripts/test-mj26-results.ts`, leakage gate in `scripts/results/verify-mj26-public.mjs`).

The pipeline is the same logic that produced the verified English With Miss Jay showcase; both sites recompute identical figures from the identical export (same source fingerprint), so the two sites can never disagree.

## Pipeline (reproducible)

```bash
npm run results:build                                   # scripts/source/mj26_source.csv → src/lib/results/mj-2026.public.json (+ audit + this generated section)
npm run results:portraits -- --from <dir of reviewed 320px WebP>   # consent-gated import → public/results/mj-2026/*.webp + mj-2026.photos.json
npm run test:results                                    # dedup / consent / reconciliation / speed contract / PII regression
npm run build                                           # prebuild + postbuild run the leakage gate on artifacts and static output
```

## Normalisation
* Grade: `A*`, `A`, `B`, `C`, `D` (also accepts `E`, `U`); "Other" and blank are **unclassified** and never counted as any grade.
* Syllabus: parsed from the qualification answer — `1123`, `0500`, `0510/0511 → 0510`, `9093`; blank → unknown (excluded from public evidence).
* Names: whitespace collapsed; ALL-CAPS / all-lowercase entries title-cased; mixed-case kept as typed.
* Whitespace, case and label variants are normalised; substantive data is never changed.

## De-duplication key
`lower(email) + normalised(name)`. Same key **and** same grade + syllabus → exact duplicate, the **latest** submission is kept (its consent answers supersede earlier ones). Same key but conflicting grade/syllabus → **ambiguous**, all rows held. Two different e-mails with the same name are two people (never merged on name).

Found in this export: 7 exact re-submissions (same student, same result), 0 ambiguous duplicates, 1 name collision across two different e-mails (kept as two people), 1 blank row.

## Consent model (least privilege)
The form asked two independent questions:
1. "Can we share your result on Instagram, our website and WhatsApp?" → *Yes, with my name* / *Yes, but hide my name* / *No, please keep it private*
2. "Are you comfortable with us posting a photo of you alongside it?" → *Yes, I will upload one below* / *No, result only* / *No photo and no result, keep everything private*

| Share answer | Photo answer | Outcome |
|---|---|---|
| Yes, with my name | Yes + file supplied | **Named + portrait** (after editorial review) |
| Yes, with my name | Yes, no file | Named, no portrait (hold: `photo_consent_without_file`) |
| Yes, with my name | No, result only | Named, no portrait |
| Yes, but hide my name | any | **Anonymous** ("Student #NNN"), never a portrait (hold `photo_without_name_consent` when a photo was offered) |
| No, please keep it private | any | **Private** — not shown, not counted in any public figure |
| any | No photo and no result, keep everything private | **Private** (conflict resolves to privacy) |
| blank | any | **Private** (`consent_missing`) |

Never published: result screenshots (they show other subjects and candidate details), free-text messages, e-mail, WhatsApp number, form timestamps, Drive links, internal row ids. Public records carry only: archive id, grade, syllabus, display name (named only), portrait flag.

### Portrait editorial holds
After the consent gate, every consented upload was reviewed on a contact sheet. Six are held because they are not a photograph of the student alone: a public figure's photo, a group photo (others did not consent), a school poster with third-party branding, a no-person shot, a no-face shot, and one video upload. The results themselves stay public; only the portrait is withheld. Holds are recorded by archive id in `scripts/results/import-mj26-portraits.ts` and in `src/lib/results/mj-2026.audit.json`.

## Denominator language used on the site
* "**X% achieved an A or A\***" — denominator = **publicly shared records** (students who agreed to sharing), stated inline as "N of M M/J 2026 result records shared with permission".
* We never say "X% of students taught": the form is a self-selected results survey, not the full roster.
* Grades are **self-reported** with a statement-of-results screenshot on file; the site says so. No future grade is promised.

## Animation pacing (readability contract)
Three rows, directions left / right / left. Each track holds two identical segments and travels exactly one segment per loop (seamless). Duration is computed at runtime from the measured segment width ÷ target speed so pace is in pixels per second: desktop 28 / 26 / 29, tablet 25 / 23.3 / 25.9, mobile 21 / 19.5 / 21.7. Rows pause on hover, on keyboard focus, while the detail dialog is open and while offscreen; reduced motion renders a static wrapped grid with every result and every interaction intact.

<!-- GENERATED by scripts/results/build-mj26-results.ts — do not edit by hand -->
## Generated figures (source fingerprint `8221580849f05068`, generated 2026-09-03T02:15:32.863Z)

### Denominators

| Denominator | Count | Meaning |
|---|---:|---|
| Raw form responses | 325 | every non-blank row in the export |
| Incomplete rows | 1 | no e-mail, no name and no grade — dropped |
| Exact duplicates removed | 7 | same e-mail + name + grade + syllabus; latest submission kept |
| Ambiguous duplicates held | 0 | same e-mail + name but conflicting grade/syllabus; all rows held |
| **Unique result records** | **317** | one row per student-per-syllabus after de-duplication |
| Unique students | 317 | distinct e-mail + name identities (0 sat more than one syllabus) |
| Grade unclassified | 3 | answered "Other" or blank — never counted as any grade |
| Syllabus unknown | 3 | qualification blank — excluded from public evidence |
| **Graded unique records** | **314** | unique records with a Cambridge grade A*–U |
| Private / held | 18 | student asked to keep the result private, gave no answer, or gave conflicting answers |
| **Publicly shareable records** | **293** | student answered "Yes, with my name" or "Yes, but hide my name" |

### Grade distribution

| Set | Records | A* | A | B | C | D | E | U | A/A* | A/A* % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| All graded unique records (internal reference) | 314 | 142 | 123 | 39 | 7 | 3 | 0 | 0 | 265 | 84.4% |
| Publicly shareable records (what the website shows) | 293 | 134 | 118 | 34 | 6 | 1 | 0 | 0 | 252 | 86.0% |
| Shareable · 1123 | 287 | 133 | 116 | 32 | 5 | 1 | 0 | 0 | 249 | 86.8% |
| Shareable · 0500 | 2 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 50.0% |
| Shareable · 0510 | 4 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 2 | 50.0% |

### Identity levels inside the shareable set

| Level | Count |
|---|---:|
| Named (student chose "Yes, with my name") | 211 |
| Anonymised (student chose "Yes, but hide my name") | 82 |
| Portrait consented and supplied (named + "Yes, I will upload one" + file present) | 73 |

### Holds by reason

| Reason | Rows |
|---|---:|
| `incomplete_row` | 1 |
| `exact_duplicate_superseded` | 7 |
| `grade_unclassified` | 3 |
| `syllabus_unknown` | 3 |
| `consent_private` | 15 |
| `consent_missing` | 1 |
| `consent_conflict_private_photo_answer` | 2 |
| `photo_without_name_consent` | 2 |
| `photo_consent_without_file` | 2 |