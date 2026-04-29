# Jaweria Amer Academy

A premium Cambridge O Level learning platform designed for high-performing students aiming for top academic results.

## Overview

Jaweria Amer Academy is a structured, exam-focused learning platform built around how Cambridge examiners actually award marks. The site presents premium academic offerings through a calm, high-trust experience designed for serious students and parents—rubric-led practice, explicit outcomes, and mentorship rather than syllabus-only coverage.

## Features

- Course directory with structured academic pathways
- Individual course pages with outcomes, syllabus breakdown, and curriculum details
- Free resource vault with past papers, marking schemes, examiner reports, and checklists
- Mobile-first responsive design
- SEO-ready static pages for strong performance
- WhatsApp inquiry and enrollment flow
- Centralized course data in `src/lib/data.ts` for straightforward content updates
- Legal pages (`/privacy`, `/terms`) and a password-protected admin area (`/admin`) for operations when configured

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

Also used where relevant: Zod (validation in server actions), Sonner (admin toasts).

## Project structure

**Routes**

- `/` — Homepage
- `/courses` — Course directory
- `/courses/[id]` — Course detail pages (statically generated from `courses` in `src/lib/data.ts`)
- `/resources` — Free Vault
- `/about` — Professional bio and teaching philosophy
- `/privacy`, `/terms` — Legal
- `/admin` — Dashboard (login at `/admin/login`; requires environment variables—see below)

**Code (high level)**

| Path | Purpose |
|------|--------|
| `src/app/` | App Router pages, layouts, `globals.css` |
| `src/lib/data.ts` | **Primary content source** — `courses`, `resources`, `siteConfig` (SEO defaults, WhatsApp, navigation, etc.) |
| `src/lib/admin/` | Admin auth and server actions |
| `src/components/` | Shared UI; `src/components/admin/` for admin chrome |
| `next.config.ts` | Sends `X-Robots-Tag: noindex, nofollow` on `/admin/*` (no deprecated middleware) |
| `public/` | Static assets |

## Local development

**Requirements:** Node.js 20.9+ (see `engines` in `package.json`).

Install dependencies and configure environment:

```bash
cd jaweria-amer
npm install
cp .env.example .env.local
```

Edit `.env.local` using [Environment variables](#environment-variables). You can skip admin-related variables until you use `/admin`.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (no emit) |

## Build

```bash
npm run build
```

Resolve any TypeScript or ESLint issues before deploying. Set `SESSION_SECRET` in production when using `/admin` (see below).

## Environment variables

Copy `.env.example` to `.env.local` for development. On Vercel, set the same keys under **Project → Settings → Environment Variables** (Production and Preview as needed).

| Variable | Scope | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Public | Site origin, no trailing slash (e.g. `https://www.yourdomain.com`). Used for metadata, canonical URLs, `sitemap.xml`, and `robots.txt`. |
| `NEXT_PUBLIC_GA_ID` | Public | Optional. GA4 measurement ID (e.g. `G-XXXXXXXXXX`). When set in **production**, the site loads GA4 and client helpers in `src/lib/analytics.ts` send events. |
| `GOOGLE_SITE_VERIFICATION` | Server | Optional. Search Console verification string (the `content` value from the HTML tag method). Rendered in root metadata when set. |
| `SESSION_SECRET` | Server | Admin session signing. **Required in production** for `/admin`. Prefer a long random value (e.g. `openssl rand -base64 32`). |
| `ADMIN_EMAIL` | Server | `/admin/login` email |
| `ADMIN_PASSWORD` | Server | `/admin/login` password (use a strong, unique value) |

WhatsApp number, default message, and public contact fields live in `src/lib/data.ts`, not in env vars.

Do not commit `.env` or `.env.local`. `.env.example` uses placeholders only.

### How to connect analytics

1. Create a GA4 property and copy the **Measurement ID** (format `G-XXXXXXXXXX`).
2. In your host (e.g. Vercel), set `NEXT_PUBLIC_GA_ID` to that value for **Production**.
3. Redeploy. Events are sent from `src/lib/analytics.ts` only when GA is configured and `gtag` is available (no-op in development and when the variable is unset).

### How to verify Search Console

1. In [Google Search Console](https://search.google.com/search-console), choose the **HTML tag** verification method and copy the **content** attribute value only.
2. Set `GOOGLE_SITE_VERIFICATION` to that string in your deployment environment (server-side; do not prefix with `NEXT_PUBLIC_`).
3. Redeploy, then click **Verify** in Search Console.

### Environment variables needed (checklist)

For a typical production handoff, set at least:

- `NEXT_PUBLIC_SITE_URL` — canonical base URL (required for accurate SEO URLs).
- `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — if you use `/admin`.
- `NEXT_PUBLIC_GA_ID` — when you are ready to enable GA4.
- `GOOGLE_SITE_VERIFICATION` — when you connect Search Console.

Optional: `RESEND_API_KEY`, `RESEND_FROM` for password reset email (see `.env.example`).

## Deployment (Vercel)

1. Point the project at this directory (the folder that contains `package.json`).
2. **Node.js:** use **20.x** (Next.js 16 requires `>=20.9.0`; Node 18 is not supported).
3. Framework: **Next.js**. Build: `npm run build`. Output: default.
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
5. If you use admin: set `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
6. Deploy. A custom `vercel.json` is not required for a standard App Router app.

For accurate Open Graph URLs on preview deployments, set `NEXT_PUBLIC_SITE_URL` to the preview URL for that environment.

## Brand and positioning

- **Tone:** Mentor–scholar: calm, structured, high-trust.
- **Audience:** Serious O Level students and parents (Karachi-focused positioning in on-site copy where relevant).
- **Promise:** Exam-oriented structure aligned to how papers are marked, without hype or implied grade guarantees.

Design tokens live in `src/app/globals.css` and Tailwind configuration; change sparingly unless updating brand guidelines.

## Maintaining course and site content

1. Edit `src/lib/data.ts`.
2. **`courses`** — Each `id` becomes `/courses/[id]`. Match the `Course` type. New entries are picked up by `generateStaticParams` on the next build.
3. **`resources`** — Match the `Resource` type for the vault listing.
4. **`siteConfig`** — Site title, meta description, WhatsApp, stats, roadmap, navigation.

After material edits, run `npm run build` to confirm types and static generation.

## Optional future improvements

- Wire vault downloads to real PDFs or official CAIE links.
- Replace the About page portrait placeholder with a production image.
- Stronger admin auth (e.g. SSO) if multiple operators need access.
- Automated smoke or E2E tests on deploy.

## License

MIT — see [LICENSE](./LICENSE).
