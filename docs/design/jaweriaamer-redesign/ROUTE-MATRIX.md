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
| `/admin/login` | background + contrast classes | ✔ | | ✔ | | VERIFIED | noindex header, redirect, wrong credentials rejected (local production build, test credentials) |
| `/admin/*` dashboard | sidebar/topbar/background classes | ✔ | | ✔ | | VERIFIED | Nine admin pages load when signed in with local test credentials; logout returns to login. Auth, cookies, APIs untouched. `/admin/resources` overflows at 390px here (160px) and on `main` (178px) — pre-existing |

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

| Same Playwright script on the Vercel preview of `6e627a4` (11 Nov 2026) | 68 / 69, same single miss. 14 routes × 320 / 390 / 768 / 1440 clean; PDF 200/206, MCQ, results dialog, category deep links, mobile menu, admin redirect/401 all pass. A valid registration submit was deliberately skipped on the preview because it would write a real enquiry |
| Same script on the Vercel preview of `84420b1` (11 Nov 2026) | 68 / 69, same single miss |
| LMS walkthrough video on that preview, real Chrome, 1440 and 390 (mobile emulation) | plays; playback position advances (6m48s video) |
| Announcement strip on that preview | headline visible at 390px, compact at 320px, no overflow |

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

1. **Enquiry delivery — handled in PR #15, not here.** Two faults were found on `main`: the admin enquiry
   inbox fails to load once the list reply exceeds 8 KB (so saved enquiries could not be seen), and no code
   path e-mails the teacher. Both are fixed in #15, which shares no files with this branch.
2. **LMS walkthrough video.** `origin/main` still showed the Instagram placeholder. This branch adds the
   approved `GAQi9OgSpCI` embed using the same field name and component path as the uncommitted work in the
   main checkout, so the two converge. The separate LMS login page was not touched.
3. **Stale October/November copy — fixed.** The readiness banner on `/resources`, its quiz dialog and its
   result messages no longer name an exam month; they now speak about "your next Cambridge exam series".
   The 80% threshold, questions, scoring and reward gating are unchanged. The results-page closing line
   was made timeless the same way. No batch date was invented.
4. **CMS persistence.** Admin writes go through `src/lib/admin/cms-store.ts` unchanged. Whether they persist
   on Vercel was not investigated (historical note only).
5. **Footer help links — reconciled.** The four links from the uncommitted main checkout (Class Timings,
   FAQ, Exam Countdown, Free Study Plans) are listed in `src/lib/footer-links.ts` with `live: false`, because
   their pages are not on this branch and must not 404. When those pages land, set `live: true`; the column
   heading becomes "Help & Legal" automatically. A guard in `scripts/test-public-claims.ts` fails if a link
   goes live without its page. The main checkout's own edits to `footer.tsx` and `home-preview.tsx` will
   still conflict textually with this branch and should be dropped in favour of this branch's versions.

## Not done

- No text search was added to the resources hub (existing category, paper, year and section filters kept).
- Individual resource cards keep their card form; only hover scale/lift was removed and colours aligned.
- Results components were re-toned and re-typeset through CSS; their markup is unchanged.

## Rollback

Single PR, no data or schema changes: revert the merge commit (or redeploy `4a85de86`).
