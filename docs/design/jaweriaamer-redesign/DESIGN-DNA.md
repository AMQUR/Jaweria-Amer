# Design DNA — jaweriaamer.com editorial redesign

**The idea: a marked exam script.** Ivory paper, ink, the examiner's crimson pen, a ruled left margin,
and Cambridge syllabus codes set the way a fixture list sets dates. It comes from the subject (how
Cambridge English is taught and marked), not from the reference's concert world.

## What was taken from the reference, and what was not

| Reference characteristic (measured) | Jaweria adaptation (original) | Deliberately not carried over |
|---|---|---|
| Date-led rows: big numerals, name as focus, CTA at the end | `InteractiveCourseRow`: syllabus code (1123, 0500, 0510/0511, 9093) → course name → real duration/schedule → arrow | Ticket cards, perforations, "admit one" stubs, tear gimmick, thumbnails |
| Pointer tilt ≈4° on every card + specular highlight | Tilt bounded to ≤1.1° X / 0.7° Y on course rows, ≤2.4° on the portrait; soft highlight inside the wash | Tilt on forms, PDFs, MCQs, results, legal text; idle float loop |
| One easing `cubic-bezier(.32,.72,0,1)`, arrow travel, underline draw | Same easing token `--ed-ease`; arrows travel 4–8px; nav underline draws in | Custom cursor, smooth-scroll library, grain overlay, glass blur |
| Wide techno display type, uppercase | Bricolage Grotesque, sentence case, condensed via the `wdth` axis | Michroma/Eurostile/Hyperwave, all-caps headings |
| Red/black/cream stage palette | Brand crimson `#701414`, oxblood `#2a0a0d`, paper `#f7f2e9`, ink `#1f0e11` | `#f40009` red, artist imagery, sponsor marks |
| Siblings stay at full opacity | Siblings recede to 0.42 so the lit row is the only event | — |

## Type

| Role | Family (licence) | Setting |
|---|---|---|
| Display, headings, numerals | Bricolage Grotesque (SIL OFL, via `next/font/google`, self-hosted at build) | weight 650–750, `wdth` 75–92, tracking −0.022 to −0.026em |
| Body / UI | Source Sans 3 (SIL OFL) | root 17px, 1.5–1.7 line height |
| Teacher's own words only | Literata italic (SIL OFL) | quotes and the hero promise; not preloaded |

Scale: hero `clamp(3rem,10.6vw,8.6rem)` · page title `clamp(2.6rem,9.5vw,7.25rem)` · section
`clamp(2rem,4.6vw,3.75rem)` · row title `clamp(1.45rem,5.4vw,2.7rem)` · syllabus code
`clamp(2.6rem,5vw,4.5rem)` · label 13px semibold sentence case with a 28px rule · body 17–18px.
Family resemblance with the LMS redesign (PR #783): the same three families and the ruled-row idea.
Nothing is imported from the LMS repository.

## Colour tokens (`src/app/globals.css`)

`--color-paper #f7f2e9` · `--color-paper-deep #efe7d9` · `--color-ink #1f0e11` · `--color-crimson #701414`
· `--color-oxblood #2a0a0d` · `--color-rose #a84562` · `--color-brass #a07a3f` · `--color-rule rgba(31,14,17,.14)`.
Results block keeps its self-contained dark tokens, re-toned to the brand (`--results-bg #150809`,
accent `#ff5d6c`, 6.6:1). Contrast (computed, WCAG 2): ink on paper 16.7:1, paper on crimson 10.5:1, paper on oxblood 16.4:1,
crimson on paper 10.5:1, muted ink on paper 9.8:1, slate on paper 7.0:1 (6.4:1 on paper-deep),
rose label `#f0a79d` on oxblood 9.3:1.

## Layout

Left-aligned throughout. `.ed-wrap` max 82rem with a `clamp(1rem,4vw,3.5rem)` gutter. A crimson
hairline runs down the left gutter of every page intro (`.ed-margin`). Sections alternate paper /
dark results / paper / paper-deep / oxblood / paper / crimson / oxblood. Lists are ruled, not carded.
Hero treatments: (1) home — giant headline, arched crimson portrait stage, proof card with denominator,
syllabus index strip; (2) inner pages — `PageIntro` with margin rule and optional aside;
(3) course detail — `PageIntro` with the syllabus code as a 10rem graphic.

## Motion

Transform/opacity/translate only. Durations: 0.25s press, 0.35s colour, 0.45–0.55s travel, 0.9s page-load
rise. One orchestrated load sequence per intro (CSS-only, so content is never hidden without scripts);
no scroll-triggered reveals. `prefers-reduced-motion` removes tilt, slide, magnet and intro animation
while keeping colour state changes.

## Components

`src/components/editorial/`: `InteractiveCourseRow` (+ `courseSyllabusCodes`, `SyllabusCode`),
`PointerField` (the only pointer listener; rAF, CSS variables, no React state), `PageIntro`, `Arrow`.
CSS primitives: `.ed-btn*`, `.ed-link`, `.ed-rows/.ed-row*`, `.ed-stage`, `.ed-label`, `.ed-h2/.ed-h3`,
`.ed-display`, `.ed-num`, `.ed-quote`, `.ed-field`, all inside `@layer components`. No new dependencies.
