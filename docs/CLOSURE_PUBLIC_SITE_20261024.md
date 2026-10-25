# Public site closure — 2026-10-24

**Repo:** [AMQUR/Jaweria-Amer](https://github.com/AMQUR/Jaweria-Amer) · **Site:** jaweriaamer.com  
**Branch reviewed:** `codex/public-site-closure-20261024` @ `origin/main` tip (`0402ccb`)  
**Scope:** Safe interface-only verification of five teacher public asks. No invented media, fees, or batch dates.

---

## Summary

| # | Ask | Status | Blocker |
|---|-----|--------|---------|
| 1 | Free diagnostic submissions | **Partial** | Feature gated off in production until env + privacy approval |
| 2 | Personalized diagnostic feedback | **Partial** | Same as #1; OpenAI + Supabase quota RPC required at runtime |
| 3 | Two syllabus-organized demo lessons | **Exists** | Approved Supabase HLS URLs in config (owner-published) |
| 4 | LMS walkthrough placement | **Partial** | First-party `walkthrough.src` empty; Instagram reference + honest placeholder UI |
| 5 | Updated batch announcements | **Exists** | Oct window ended 2026-10-16; bar shows non-dated fallback copy |

---

## 1–2. Free diagnostic / personalized feedback

**Routes:** `/free-evaluation`, `POST /api/free-evaluation`  
**Key files:** `src/lib/evaluation/server.ts`, `src/components/public-experience/evaluation-form.tsx`, `src/app/(public)/page.tsx`

**Gating:** `evaluationAvailable()` requires **all** of:

- `FREE_EVALUATION_ENABLED=true`
- `FREE_EVALUATION_PRIVACY_APPROVED=true`
- `OPENAI_API_KEY`, `OPENAI_EVALUATION_MODEL`
- `EVALUATION_IDENTITY_SECRET` (≥ 32 chars)
- `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) + `SUPABASE_SERVICE_ROLE_KEY`

Defaults in `.env.example` keep flags **false** until privacy review. When unavailable, the home CTA and `/free-evaluation` show “coming soon” / “Explore Free Evaluation” and the API returns **503** without collecting work.

**To go live (owner):**

1. Review OpenAI retention/settings and `src/app/(public)/privacy/page.tsx` (evaluation section).
2. Set the flags above in Vercel production; redeploy.
3. Run one consented smoke test (text + optional PDF under 2 MB).

No Stripe or payment integration is involved in the diagnostic flow.

---

## 3. Two demonstration lessons

**Config:** `src/lib/public-experience.ts` → `publicExperience.lessons` (two O Level 1123 entries)  
**UI:** `src/components/public-experience/home-preview.tsx` (`#free-lessons`)

Both slots use owner-approved Supabase public HLS URLs and posters. Empty `src` would show the MediaPlayer “coming soon” placeholder (not used while URLs are populated).

---

## 4. LMS walkthrough

**Config:** `publicExperience.walkthrough` — `src` and `poster` are **empty**; `reference` is the owner Instagram post `https://www.instagram.com/p/DeNJh7uDAni/`.

**UI:** `home-preview.tsx` renders a labeled placeholder and outbound link when `src` is falsy; native `MediaPlayer` only when an approved HTTPS direct video URL is supplied. No fake embed URL or scraped Instagram video.

**Blocker for first-party playback:** Owner supplies an approved HTTPS video URL (and optional poster) in `walkthrough.src` / `walkthrough.poster`.

---

## 5. Batch announcement

**Config:** `publicExperience.batch` with `visibleFrom` 2026-10-08, `expiresAt` 2026-10-16 (+05:00).

**Logic:** `getBatchAnnouncement()` swaps message and CTA to evergreen copy when outside the window (`isBatchAnnouncementActive` false). As of 2026-10-23, visitors see fallback text, not “after 15 October”.

**UI:** `src/app/(public)/layout.tsx` passes `batch={getBatchAnnouncement()}` to `StickyWorkshopBar` (bar stays visible with updated copy after expiry).

---

## Verification

```bash
npm run test:public-experience
```

Contract tests cover batch expiry, lesson config, walkthrough empty `src`, and evaluation gating.

---

## Out of scope (unchanged)

- No PDFs added to the repo; resources remain Supabase/CDN URLs.
- No fabricated stats, testimonials, or pass rates.
- Registration remains Google Form / internal interest capture; no invented merchant credentials.

---

## Addendum — 2026-10-25 final verification (Agent 8)

- Free diagnostic remains **gated**: production has `FREE_EVALUATION_ENABLED=false`; `FREE_EVALUATION_PRIVACY_APPROVED=true` is set but no documented owner/provider-retention sign-off exists, so it was not switched on. `POST /api/free-evaluation` returns 503 and `/free-evaluation` shows "coming soon".
- Both HLS lessons verified on production: all 272 + 198 segments return 200, both play in-browser and advance.
- Hero "Enrolment Open" badge was a standing claim after the 2026-10-16 window ended; it now renders only inside the dated batch window (#9).
- Page-level `openGraph` dropped the share image / `og:url`; fixed through `src/lib/seo.ts` (#9).
- `/results` at 320px: long result names no longer widen the page (capsule truncates).
- Spelling Bee: no references in `src/` (guarded by `scripts/test-public-claims.ts`).
