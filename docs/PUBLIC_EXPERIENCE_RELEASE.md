# Public website revamp — release report

## A. Audit

See `PUBLIC_EXPERIENCE_AUDIT.md`. Next 16.2.3/React 19/Tailwind 4 public marketing site, independently signed admin sessions, Google Form enrollment, GA4, public Supabase resources and consent-safe results. Student LMS is a separate project and was not edited. Existing admin CMS fields still feed the consolidated hero. Its filesystem storage remains an existing hosting limitation.

## B. Implemented

One CMS-aware hero/H1, shorter benefits and portrait, a warm pink date-aware announcement replacing the old overlay bar, clearer registration navigation, a free evaluation preview/form/results route, two honest configurable demo slots and a student-experience walkthrough section. Verified results stay directly after the hero. Free preview appears before the longer value/course sections. Existing courses, stats, roadmap, resources, legal and community content remain available.

## C. Banner

“Your next A starts here. New batches start after 15 October.” CTA: “Join the New Batch”, destination `https://forms.gle/LbYPC63MWP1foWZC6`. Visible from 8 October 2026 Pakistan time, expires at midnight on 16 October Pakistan time. Cached public pages refresh within 60 seconds; dynamic homepage uses request time. Configuration: `src/lib/public-experience.ts`. Dismissal keeps reserved height. No timers revealing overlays or mobile bottom takeover.

## D. Free evaluation

`/free-evaluation` and POST `/api/free-evaluation`. All four verified public tracks: 1123, 0500, 0510/0511, 9093. Narrative, descriptive, summary, comprehension and grammar; Directed Writing excluded. The preview offers general practice guidance, not an official paper-specific grade. Three visible steps cover course/type, question/answer, details/consent. Text (80–12,000 characters) or one PDF/JPG/PNG ≤2 MB; question/source text required. First name/email stay out of the provider payload. Work is passed in memory to the Responses API, with `store:false`, strict JSON schema and Zod validation. Results show evidence-based strengths, the biggest opportunity, improvements, an optional revision and next focus. Value precedes the enrollment CTA. Unreadable work receives a practical next action. Provider timeout 45 seconds; no automatic paid retries.

**Currently disabled in production.** No provider key/model or privacy approval was supplied. Availability and API fail closed. Disabled page collects nothing and links to free resources. Mocked provider/route tests and local form/results QA passed; actual provider inference remains unverified.

## E. Demo lessons

No approved pair was found. Both slots currently say coming soon; no fake titles, thumbnails, durations or videos are published. Slots target the real O Level 1123 course until the owner confirms classification. Supply each lesson's approved title, description, actual course ID, HTTPS direct video URL, optional poster and known duration in `publicExperience.lessons`. Native player supports direct MP4/WebM files, not YouTube watch URLs. Existing YouTube channel is linked for real public lessons. Do not copy gated LMS recordings into these slots.

## F. LMS walkthrough

Owner-supplied `https://www.instagram.com/p/DeNJh7uDAni/` is a labeled outbound reference. No scraping, Instagram SDK or iframe dependency. First-party `walkthrough.src` and optional poster remain empty; supply an approved HTTPS direct video URL to enable native playback. Benefits reuse the existing published programme claims; they were not independently verified inside the separate authenticated LMS.

## G. Conversion

Enrollment CTA in header, hero, announcement and walkthrough uses the same existing form. Free preview is an internal action, WhatsApp remains support, and community stays secondary. Google Form redirects signed-out visitors to Google sign-in. This is disclosed beside the hero CTA. End-to-end form submission and field-count audit remain blocked by that external login; no Google Form settings were changed.

## H. Security

No file storage or student assignment writes. Bounded request reader (2 MB plus 64 KB form overhead), extension/MIME/signature checks, no SVG/archives, plain PDF requirement, no trusted filename paths, same-origin POST, signed HttpOnly/SameSite browser cookie, HMAC identities with a separate stable secret, atomic distributed quotas and fail-closed backend errors. Email and browser each get one lifetime attempt by default (only `FREE_EVALUATION_LIMIT=2` permits two); five-minute cooldown for a second attempt, five per network/hour and 50 globally/day. Attempts consume allowance before analysis; failures may count and this is disclosed. This bounds anonymous abuse but does not verify mailbox ownership or guarantee a per-person identity across changed emails/browsers/networks. Uploaded content is untrusted, cannot change system instructions, receives no tools or secrets, and cannot claim official grades. Feedback is escaped React text. No public results endpoint, raw storage URL or document enumeration exists. Short-lived network/global counters expire and are cleaned on subsequent requests; persistent identity counters enforce lifetime limits. Work/results have zero first-party retention. OpenAI may retain abuse-monitoring content under its data policy; review account settings before enabling. Existing auth, resource isolation and schemas untouched.

## I. SEO + performance

One H1; existing root metadata, OG image, structured data, canonical URLs, results methodology and indexed course/resource pages retained. Evaluation has metadata/canonical/sitemap entry. No runtime dependencies added. Homepage remains server-rendered; native players load only after explicit play and use metadata preload, controls, fixed 16:9 space, no autoplay and error fallback. Public pages keep caching with 60-second revalidation for announcements. Existing font optimization retained, portrait quality aligned to configured Next default. No real-user LCP/CLS/INP measurements are available, and no fabricated scores are reported.

## J. Validation

Baseline and final: `npm test`, `npm run typecheck`, `npm run build` (includes public results privacy gate) pass. New `npm run test:public-experience` covers dates, media placeholders, consent, all valid course choices, hidden/unsupported topics, size/signature validation, signed sessions, hashed quotas, provider schema/success/failure/timeout and POST contracts (403, 400, 413, 429, 503, 200 text/file). Changed files pass direct ESLint and Prettier 3.6.2 formatting; `git diff --check` passes. Whole-repo `npx eslint .` reports the pre-existing `react-hooks/set-state-in-effect` error at `paper1-checklist-banner.tsx:70`; npm's lint script masks it. No new lint errors.

SQL `supabase/tests/public_evaluation_limits.sql` passed in a rolled-back transaction, including first/second/third use, identity changes, cooldown, network/global limits, service role and public permissions. Browser QA used the Playwright skill CLI, observed actual pages and screenshots, checked 320/375/390/430/768/1280/1440 widths, one H1 and no homepage overflow. Form/result tested with local fake credentials and intercepted test response, not live paid analysis. No false claims of full model or real-video validation. Focus moves to step/result headings; reduced-motion-safe status and banner animations; explicit labels, native file/video controls and accessible errors.

## K. Existing systems

Browser/HTTP 200: home, resources, courses, O Level detail, results, about, privacy, terms, admin login. Resource visibility and results privacy/consent tests pass. Admin APIs still reject anonymous requests. Student LMS internals are out of scope; no student/admin account or enrollment was created during tests.

## L. Database

Additive migration `20261008230213_public_evaluation_limits.sql` applied to `upyxhhbpdjlnbpraykow`. One private schema/table plus one service-role-only SECURITY INVOKER RPC, fixed search path, advisory transaction lock. RLS enabled, all public/anon/authenticated access revoked, no new storage bucket. A follow-up hardening migration moves every rejection check before identity-row allocation, so blocked requests cannot create persistent unused rows. Zero records remain from rolled-back tests. Security advisor: no warnings/errors, one informational “RLS enabled with no policy” notice — deliberate default denial for public roles. Existing resources bucket unchanged. Local migration filename matches the applied history version.

## M. Git / N. Deployment

Initial release: PR #4, merged to `main` as `fe9a69c89618d8bb5869fd3bc379a6c7a2275517` (implementation branch `codex/public-experience-revamp`, commit `ab231fad300c520b6072aeab0ce70a4788f80e45`). Production deployment `dpl_BKFd6LtwJH9nu1dSVxGckBp1wvWC` is READY at `https://jaweria-amer-wrfz-5q14sz4k6-amqur.vercel.app`, aliased to `https://jaweriaamer.com` and `https://www.jaweriaamer.com`.

Live browser verification: same seven widths, one H1, no horizontal overflow or page exceptions. Home, evaluation, resources, courses/detail, results, about, legal, admin login, sitemap/robots, portrait and representative JS/CSS assets return 200; admin API returns 401, disabled evaluation POST returns safe 503. The runtime error-log query returned no logs; this is not proof of exhaustive monitoring. Google enrollment sign-in remains external. Follow-up migration `20261008231210_harden_public_evaluation_counters.sql` is applied and tested and is recorded on branch `codex/evaluation-quota-hardening`; its PR/final release identifiers are included in the handoff.

## O. Activation and remaining assets

1. In the **public site** Vercel project `jaweria-amer-wrfz`, provide `OPENAI_API_KEY`, a Responses model supporting images/PDF/strict JSON via `OPENAI_EVALUATION_MODEL`, and a stable random `EVALUATION_IDENTITY_SECRET` of ≥32 characters. Do not paste secrets into chat, Git or NEXT_PUBLIC variables. Existing Supabase server credentials are reused.
2. Review provider privacy/retention/account settings and the published privacy page, then explicitly set `FREE_EVALUATION_PRIVACY_APPROVED=true` and `FREE_EVALUATION_ENABLED=true`. Choose one free attempt (default) or at most two with `FREE_EVALUATION_LIMIT=2`. Redeploy and run a consented real text and file smoke test before announcing availability.
3. Supply two approved demo recordings and actual metadata. Supply a first-party walkthrough recording if desired; the Instagram reference already works as an outbound link.
4. Owner decision: retain or remove Google sign-in requirement on the enrollment Form. The current login gate limits full registration QA. No enrollment architecture rewrite is required.

References checked during implementation: Supabase database function security docs, Vercel request headers docs (platform-supplied network header), OpenAI Responses structured outputs and API data controls. Provider retention is not represented as zero-retention merely because `store:false` is set.

## Phase 2 release — approved lessons and first-party enquiries

The Phase 2 branch starts from the verified production baseline `b479b2a`. The unrelated local `docs/LMS_RESOURCES_UI_AND_PIPELINE_REPORT.md` is preserved outside this release. No LMS project, student account, assignment, grade, attendance or resource visibility is changed.

### Approved media

Both original Drive recordings were transferred through Google's normal public download endpoint after the authenticated connector returned HTTP 413 for its 256 MiB limit. No authorization bypass was used.

| Approved lesson                      | Drive ID                            | Original bytes | Actual source duration         | Streaming delivery bytes |
| ------------------------------------ | ----------------------------------- | -------------: | ------------------------------ | -----------------------: |
| Directed Writing — Complete Revision | `158bWTnRzgSasc6OmWld-oTP7uxQALl3U` |    553,748,878 | 4,467.648 s (1:14:28 rounded)  |              390,593,759 |
| Writer’s Effect                      | `1WywKWR_j_QqgWz_--Dye5xsAxsM71bVW` |    345,420,696 | 3,283.733333 s (54:44 rounded) |              259,428,459 |

Approved marketing syllabus: O Level English Language 1123. The Writer’s Effect recording's original artwork also references IGCSE 0500; that artwork is preserved, with a transparent note in the card description.

Full 1920×1080 resolution is retained for slide readability. Browser-compatible H.264/AAC delivery copies use 15 fps, CRF 24 and 80 kbps audio, then are packaged as static HLS VOD streams because this storage project's single-file limit rejects the long MP4s. This is segmented delivery, not a multi-resolution adaptive ladder. Largest segment: 4,198,040 bytes. A complete viewing of both recordings transfers approximately 650 MB; hosting bandwidth remains subject to the existing Supabase plan. No paid plan was changed.

Dedicated `public-lessons` bucket allows MPEG-TS, HLS manifests and JPEG posters, with a 50,000,000-byte object limit. Only server credentials upload; no anonymous write policies were added. Original and optimized videos remain outside Git. Production media configuration is in `src/lib/public-experience.ts`, under `/storage/v1/object/public/public-lessons/v1/{directed-writing,writers-effect}/index.m3u8`. Topic-relevant JPEG posters come directly from the recordings. No caption tracks were supplied or embedded; the player accepts a future approved captions track.

The player dynamically loads its pinned HLS adapter only after the student requests a lesson, uses native controls/fullscreen/playsInline, holds the video aspect ratio, displays loading and retry states, supports seeking, and saves only playback position locally. After 30 seconds of actual playback it displays a quiet enrollment CTA below the player. Seeking alone does not count as engagement. Impressions, plays, progress and completions use existing GA4 helpers without personal details.

### First-party registration interest

`/register` collects only name, email, syllabus and contact consent. It creates no payment or LMS account. The original Google Form remains linked as the detailed enrollment route and its historical responses/settings are untouched; connected Drive discovery found no editable Form, and a signed-out browser still reached Google login.

The new API has server validation, an empty honeypot, a purpose-signed one-hour form ticket with a two-second minimum age, same-origin checks, a streaming 4 KiB body cap, private network fingerprints, atomic five-per-network/hour and fifty-per-day global caps, and one enquiry per email per 24 hours. Retrying the same successful ticket and exact payload is idempotent. Rejected submissions allocate no extra counter or lead. Provider/storage failures never produce a false success confirmation.

The additive `20261008233338_public_registration_interest` migration creates RLS-protected private lead/counter tables. Anonymous and authenticated database roles cannot access the schema or call either RPC; only server `service_role` can submit/list. `/admin/registrations` verifies website admin authentication before querying, displays the latest 200 enquiries, and provides the email contact path. Existing `/admin/leads` and its historical records remain unchanged. Records older than 180 days are purged on an inbox review or another valid submission; the privacy policy describes this activity-triggered deletion precisely. Network counters also expire and are pruned on submissions.

A signed-out local browser submission was confirmed in the actual database and then read through the authenticated admin inbox before conversion CTAs switched to `/register`. Production persistence and admin review must be verified again on the deployed commit using clearly identified `.invalid` test data; remove only those test leads afterward.

### Date behavior, lint and security

The seasonal banner remains “Your next A starts here. New batches start after 15 October.” It transitions at 00:00 October 16 Pakistan time to “Your next A starts here. Build your English skills with guided lessons and personal feedback.” / “Explore the Next Batch”. This transition is not an enrollment deadline. Existing configuration/component is reused, and hero spacing continues to match the evergreen banner.

Checklist state restoration now happens when the student opens the quiz rather than through synchronous effect state updates. Valid saved answers, submission state, score threshold, result artwork and animations are retained. Unavailable browser storage no longer breaks quiz interaction. The stricter updated React lint rules also required asynchronous completion callbacks for four existing admin loaders and derived image-error state in the old workshop component. `npm run lint` now propagates failures instead of suppressing them.

Next.js and its ESLint configuration are pinned to 16.4.0 to resolve the installed framework's published security advisories. HLS.js is pinned to 1.7.3. Compatible dependency updates were applied; the shadcn generator is a development dependency. Runtime dependency audit reports zero vulnerabilities. The whole dependency audit still reports development-tool advisories in glob/braces and esbuild; no forced major downgrade or lint suppression was used.

Existing admin sessions previously encoded the signing secret in the cookie and checked no expiry. They now use purpose-separated HMAC signatures, constant-time verification, server-enforced 24-hour expiry, configured admin identity checks, legacy-cookie rejection and missing-secret failure. The website SESSION_SECRET was rotated in Preview and Production and remains sensitive in Vercel. Admins must sign in again after release. The LMS authentication system is unchanged.

Advertising is loaded lazily on public content routes rather than on the homepage, registration, evaluation or admin entry routes. Mobile portrait requests match the actual displayed portrait width. Player accessible names match visible button labels, and feedback/footer text contrast is corrected. Existing publisher configuration is retained on content pages.

### Evaluator and analytics activation boundaries

The project-scoped Vercel Preview/Production settings, ignored local project configuration and current process contain no authorized `OPENAI_API_KEY`. No applicable provider-retention privacy approval is documented. Real inference is therefore **not operational**, and the existing fail-closed evaluator remains disabled. No student work is accepted while disabled. The server still uses the OpenAI Responses API with `store:false`, no tools, strict structured output, a 2 MiB attachment cap, a 45-second provider timeout and no automatic retries. No model is configured or falsely claimed tested. Provider monitoring retention is accurately disclosed; `store:false` is not zero retention.

Activation still requires the owner's approved OpenAI project credential, compatible model configuration, a dedicated stable identity secret, documented data-policy approval, enabled flag and allowance (default one; maximum two). Existing atomic lifetime/cooldown/IP/global protections and PR #5 rejection behavior are preserved. Contract tests now cover image submission and injection boundary behavior in addition to typed/PDF submissions, malformed outputs, ungrounded evidence, timeouts, bad files, oversize requests, consent and quota rejection. Mocked tests do not prove real inference or model-level injection resistance.

The existing production `NEXT_PUBLIC_GA_ID` has an empty value. All requested funnel events are instrumented, including a registration completion event emitted only after confirmed persistence, but collection cannot be verified until a real GA4 measurement ID is configured. Placeholder IDs are ignored. No name, email, submission text or file content is sent in the event payloads.

The Instagram LMS reference remains `https://www.instagram.com/p/DeNJh7uDAni/`; the first-party walkthrough configuration remains empty until the owner's approved recording arrives.

### Verification record

Passed: formatting of changed files; `npm run lint`; `npm run typecheck`; `npm test` (resource visibility, results privacy, public experience contracts, registration contracts and admin session tests); both rollback-only SQL suites in `supabase/tests/`; `npm run build` including the built public-data safety gate; `git diff --check`; `node scripts/check-size.js`; runtime dependency audit; secret/binary review.

Browser evidence is kept in ignored `output/playwright/`. Seven requested widths (320/375/390/430/768/1280/1440) showed one H1 and no horizontal overflow. No HLS manifests or segments fetched before a play request. Both lessons advanced playback at desktop and mobile-sized Chromium viewports and sought to 600/900 seconds. Fullscreen and the 30-second engagement CTA passed. Saved checklist progress restored and persisted. Real private registration persistence and authenticated inbox read passed. Slow-network playback at 1.6 Mbps / 150 ms latency advanced after seeking to 1500 seconds, with a visible loading state. Physical iOS/Android devices are not available in this environment.

Initial local production-build mobile Lighthouse run: performance 62, accessibility 96, best practices 77, SEO 100, CLS 0. After early script/portrait refinements: performance 90, accessibility 96, best practices 77, SEO 100, FCP 1.355 s, LCP 3.670 s, TBT 5.5 ms, CLS 0. Subsequent contrast/script-scope fixes require final production measurements. These are lab measurements, not field Core Web Vitals or guaranteed scores.

Final deployment ID, merged commit, two-domain production playback, route regression, registration persistence and production performance evidence are recorded in the owner handoff after the Git PR workflow completes.
