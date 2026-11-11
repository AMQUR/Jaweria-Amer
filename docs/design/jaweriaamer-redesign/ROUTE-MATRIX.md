# Route matrix, verification log and limitations

Branch `redesign/editorial-site-20261110`, based on `origin/main` `4a85de86` (also the SHA of the latest
Production deployment on 10 Nov 2026). Labels: VERIFIED · VERIFIED REPO · INFERRED · NOT TESTED · BLOCKED.

## Jaweria route inventory (from `src/app`, `sitemap.ts`, nav, footer)

| Route | Template changed | 1440 | 768 | 390 | 320 | State | Notes / exclusions |
|---|---|---|---|---|---|---|---|
| `/` | `live-session-hero`, `page.tsx`, `home-preview` | ✔ | ✔ | ✔ | ✔ | VERIFIED | Results block still directly follows the hero (test-locked) |
| `/about` | `about/page.tsx` | ✔ | ✔ | ✔ | ✔ | VERIFIED | Placeholder "JA" tile replaced by the real portrait; copy unchanged |
| `/courses` | `courses/page.tsx`, `InteractiveCourseRow` | ✔ | ✔ | ✔ | ✔ | VERIFIED | Filters, 4 offered tracks only |
| `/courses/o-level-english-1123` | `courses/[id]/page.tsx` | ✔ | ✔ | ✔ | ✔ | VERIFIED | Direct load + reload |
| `/courses/igcse-esl-0510-0511` | same | ✔ | ✔ | ✔ | ✔ | VERIFIED | Direct load |
| `/courses/igcse-fle-0500` | same | ✔ | ✔ | ✔ | ✔ | VERIFIED | Direct load |
| `/courses/a-level-english-9093` | same | ✔ | ✔ | ✔ | ✔ | VERIFIED | Direct load |
| `/courses/english-literature`, `/courses/creative-writing-workshop` | — | 404 | | | | VERIFIED | Unoffered legacy entries stay hidden |
| `/results` | palette/type via `globals.css` only | ✔ | ✔ | ✔ | ✔ | VERIFIED | Data, consent, dialog, methodology untouched |
| `/resources` | `resources/page.tsx`, hub presentation classes | ✔ | ✔ | ✔ | ✔ | VERIFIED | `?cat=` deep links; Directed Writing still suppressed |
| `/resources/view/[id]` (MCQ) | header only | ✔ | ✔ | ✔ | ✔ | VERIFIED | `mcq-punctuation-5min` |
| `/resources/view/[id]` (PDF) | header only | ✔ | | | | VERIFIED | `1123-s25-qp-11`, canvas render, 200/206 |
| `/register` | page layout + form classes | ✔ | ✔ | ✔ | ✔ | VERIFIED (UI) | Real durable save NOT TESTED by design |
| `/free-evaluation` | page intro + form classes | ✔ | ✔ | ✔ | ✔ | VERIFIED | Stays gated; API 503 |
| `/privacy`, `/terms` | intro + reading measure | ✔ | ✔ | ✔ | ✔ | VERIFIED | Text unchanged |
| `/sitemap.xml`, `/robots.txt` | — | ✔ | | | | VERIFIED | Unchanged |
| `/admin/login` | background + contrast classes | | | | | VERIFIED REPO | noindex header and redirect verified; visual check NOT TESTED with a session |
| `/admin/*` dashboard | sidebar/topbar/background classes | | | | | NOT TESTED | No staff credentials used. Auth, cookies, APIs untouched (`/api/admin/leads` → 401 verified) |

The uncommitted work in the main checkout adds `/class-timings`, `/exam-countdown`, `/faq`, `/study-plan`.
Those routes are not on `origin/main`, so they are out of scope here and will need the new shell applied
when they land (they inherit nav, footer, fonts and tokens automatically).

## Contracts checked at source level (VERIFIED REPO)

No changes under `src/app/api/**`, `src/lib/registration/**`, `src/lib/results/**`, `src/lib/evaluation/**`,
`src/lib/admin/**`, `src/proxy.ts`, `src/lib/resource-*`, `src/lib/mcq-data.ts`, `src/lib/data.ts`,
`supabase/**`, `next.config.ts`, `package.json` or the lockfile. No SQL, no migration, no upload, no email.
Registration form: handlers, field names, ticket, honeypot, consent, batch rule and status copy are
byte-identical; only `className` strings changed.

## Commands (10 Nov 2026, Node 24, macOS)

| Command | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run lint` | pass, 0 problems |
| `npm test` | pass (resources view-only, visibility, M/J 2026 results, public-safety gate, public experience, public claims, registration, admin session) |
| `npm run build` | pass, including `prebuild` and `postbuild` results verification (126 built files scanned) |
| Playwright QA script, production build | 68 / 69. The one miss is the script's "no console errors" check catching the browser's own 404 log for the two deliberate not-found probes |

Baseline failures: none found on `origin/main`.

One existing test was extended (`scripts/test-public-experience.ts` now asserts the approved walkthrough
video id). No test was weakened or skipped. `scripts/test-mj26-results.ts` needs the results showcase
before a `{/* Stats` marker in the home page; the section order was kept to satisfy it.

## Performance (homepage, 390×844 @2x, cold load, single run)

| | JS | CSS | Fonts | Images | Total | CLS |
|---|---|---|---|---|---|---|
| Before — production `jaweriaamer.com` | 395 KB | 27 KB | 85 KB | 164 KB | 709 KB | 0 |
| After — local production build | 220 KB | 30 KB | 196 KB | 223 KB | 730 KB | 0 |

Read with care: production loads Google Analytics and the local build does not, so the JS difference is
not attributable to this change. Fonts cost about 110 KB more (the variable display face with width and
optical-size axes is 131 KB and is preloaded); images cost more because the portrait is now shown at a
larger size. LCP/FCP are NOT MEASURED comparably (network vs localhost). Lighthouse was not run.

## Operational items (not fixed here, by design)

1. **Enquiry delivery — release-relevant.** At `4a85de86` (deployed), `/api/registration` saves the enquiry
   through a Supabase RPC and optionally forwards to the LMS intent endpoint. There is **no code path that
   emails the teacher**; `RESEND_*` is used only for admin password resets. So "saved but not in the
   inbox" is the expected behaviour of the deployed code, not an intermittent fault. An uncommitted hotfix
   (`src/lib/registration/notify.ts`, export route, admin page) exists in the main checkout. It should ship
   as its own narrow PR with its own review of recipients and secrets. Whether production rows are visible
   in website admin: NOT TESTED (no admin session, no production data access in this task).
2. **LMS walkthrough video.** `origin/main` still showed the Instagram placeholder. This branch adds the
   approved `GAQi9OgSpCI` embed using the same field name and component path as the uncommitted work in the
   main checkout, so the two converge. The separate LMS login page was not touched.
3. **Stale claim to review.** `Paper1ChecklistBanner` on `/resources` still says "Are you ready for the
   October/November batch?". It is pre-existing, tied to the gated checklist reward flow, and was left
   untouched pending an owner decision on copy. The batch announcement itself is already on its neutral
   post-window copy. Nothing paused or expired was re-published.
4. **CMS persistence.** Admin writes go through `src/lib/admin/cms-store.ts` unchanged. Whether they persist
   on Vercel was not investigated (historical note only).
5. **Merge note.** The main checkout has uncommitted edits to `footer.tsx`, `home-preview.tsx`,
   `public-experience.ts` and `sitemap.ts`. This branch rewrites the first two, so whoever lands second
   will need to re-apply the four footer links ("Help & Legal") by hand.

## Not done

- No text search was added to the resources hub (existing category, paper, year and section filters kept).
- Individual resource cards keep their card form; only hover scale/lift was removed and colours aligned.
- Results components were re-toned and re-typeset through CSS; their markup is unchanged.
- No Vercel preview was created from this session; all browser checks ran on a local production build.

## Rollback

Single PR, no data or schema changes: revert the merge commit (or redeploy `4a85de86`).
