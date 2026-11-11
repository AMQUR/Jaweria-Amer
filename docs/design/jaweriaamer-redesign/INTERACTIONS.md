# Interactions — triggers, alternatives, tests

All checks below were run in headless Chromium (Playwright) against the production build
(`next build && next start`) on 10 Nov 2026 unless marked otherwise.

| # | Interaction | Trigger | Visible result | Touch / keyboard / reduced-motion alternative | Result |
|---|---|---|---|---|---|
| 1 | Course row wash | Pointer hover (hover-capable, fine pointer) | Crimson wash rises from the rule (0.55s), text turns paper, title slides 15px, arrow travels 8px and fills, siblings fade to 0.42 | Focus: same lit state + 2-ring focus outline. Touch: `:active` lights the row; arrow always visible. Reduced motion: colour change only | VERIFIED |
| 2 | Course row depth | Pointer move over a row | `perspective(1400px)` tilt, measured 0.44° / 0.42°, hard-limited to 1.1° / 0.7°; settles on leave | Not armed for touch, pen, coarse pointers or reduced motion | VERIFIED |
| 3 | Row navigation | Click / Enter / tap anywhere on the row | Goes to `/courses/[id]`; analytics `trackCourseClick` preserved | One tab stop per row | VERIFIED |
| 4 | Course filter | Click chip | List filters (4 → 2 → 1), `aria-pressed`, live count | Buttons, keyboard operable | VERIFIED |
| 5 | Magnetic CTA | Pointer over hero / closing CTA | `translate` ≤ 6px × 4px (measured 5.4 × 3.2), resets on leave; press uses `scale`, so they never cancel | None on touch or reduced motion | VERIFIED |
| 6 | Portrait stage | Pointer over hero/about portrait | ≤2.4° tilt, figure parallax ≤8px | Static elsewhere | VERIFIED (code + visual) |
| 7 | Nav underline | Hover / current page | 1px rule draws in from the left | `aria-current="page"` | VERIFIED |
| 8 | Mobile menu | Tap menu button | Oxblood sheet, large links, CTA + WhatsApp; closes on navigation | Base UI dialog focus trap, Escape | VERIFIED |
| 9 | Announcement strip | Dismiss button | Strip collapses; spacer keeps layout | 44px target | VERIFIED |
| 10 | Lesson video | Click poster | HLS player loads on demand (unchanged logic) | Native controls | VERIFIED (poster/click); playback NOT TESTED headless |
| 11 | LMS walkthrough | Click poster | `youtube-nocookie.com/embed/GAQi9OgSpCI` iframe; nothing from the player loads before the click | Button with accessible name | VERIFIED |
| 12 | Results capsule → dialog | Click capsule | Detail dialog; Escape closes; focus returns to the capsule | Unchanged | VERIFIED |
| 13 | Results archive filter | Click grade chip | Count updates (293 → 134 for A*) | Unchanged | VERIFIED |
| 14 | Resource category doors | Click door | `?cat=` updates, list renders; deep link restores state | Buttons with `aria-pressed` | VERIFIED |
| 15 | PDF viewer | Direct load `/resources/view/[id]` | Pages render to canvas; API returns 200 and 206 for ranges | Unchanged, no motion added | VERIFIED |
| 16 | MCQ viewer | Direct load, select option | 40 options rendered, selection works; scoring code untouched | Unchanged | VERIFIED (render + select); scoring covered by existing tests |
| 17 | Registration form | Submit | Required-field blocking; batch A/B/C only for 1123; with no backend it shows the honest failure message, never "received" | No motion on fields or submit | VERIFIED locally; real save NOT TESTED (no production data written) |
| 18 | Free evaluation | Load page | Gated preview; no upload control; API answers 503 | — | VERIFIED |
| 19 | No-JS fallback | Scripts disabled | Hero, rows, real results percentage (86%, not 0) all present | — | VERIFIED |
