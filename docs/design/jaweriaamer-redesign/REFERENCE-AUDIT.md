# Reference audit — asimazhar.com (studied 10 Nov 2026)

Purpose: study a live visual/interaction reference. Nothing from it is reproduced here: no imagery,
logos, copy, fonts, event data or source. Method: `robots.txt` + `sitemap.xml`, then headless Chromium
(Playwright) at 1440×900, 768×1024 and 390×844 with computed-style measurement. Bounded: about 12
page loads, ≥1.5 s apart, public pages only, robots respected (`Allow: /`).

## Route inventory

| Route | Discovered via | Live behaviour (verified) | Counts as a distinct template? |
|---|---|---|---|
| `/` | sitemap, nav | 200. Hero, tour list (`#tour`), VIP, music, videos, press. 13,765 px tall at 1440 | Yes — home |
| `/tour/` | sitemap, nav | 200, own `<title>`/canonical, same shell and same hidden `h1`, tour section only (8,300 px) | No — home shell, filtered |
| `/tour/<city>/` ×13 (`chicago` checked) | sitemap | 200, own title/canonical, renders the home shell and scrolls to that city's row | No — deep link into `/` |
| `/tickets/` | search index, direct | 200, own title, short page (3,135 px) on the same shell. Not in the sitemap | Variant |
| `/press-kit/` | sitemap | 200, own `h1` "Press kit" | Yes — utility |
| `/#music`, `/#videos`, `/#press` | nav anchors | Sections of `/` | States, not routes |

External dependencies (recorded, not implemented): ticket sellers (Ticketmaster, Sulekha, cnydesi,
ticketwala), Spotify, YouTube, press-kit downloads, GA4.

NOT VERIFIED: ticket "tear" completion state on desktop, gyroscope tilt on a physical phone, the
`/tickets/` purchase flow, video/music playback. The reference has no hamburger menu on mobile (nav
links stay inline; a floating "Get tickets" bar appears on scroll), so there is no mobile-menu state to study.

## Measured characteristics

- Type: display `Michroma`, text `Eurostile`, accent script `Hyperwave` (self-hosted). Body 17px/1.55.
  Labels 11–12px uppercase, tracking 0.18em. City names uppercase 46px (clamp 30–52px), dates 50px.
- Palette: cream `#ffe9da`, red `#f40009`, ink `#0b0203`, blood `#7a0005`; glass panels, film grain.
- One easing everywhere: `cubic-bezier(.32,.72,0,1)`. Durations 0.25s (press scale), 0.45–0.5s
  (links, arrows, buttons), 0.9s (scroll reveals), 1.2s (clip reveals).
- Tour rows: a `ul` of 184 px "ticket" cards (grid 112 thumb / 200 date / 1fr city+venue / 280 stub).
  Hover: the card tilts with the pointer (`perspective(1100px) rotateX/rotateY` from `--rx/--ry`;
  ≈4.2° measured at 25% pointer x), a radial specular highlight follows `--mx/--my`, the stub flap
  rotates 28°, the button arrow translates 3px. Siblings do **not** dim. Cards float on a 6s loop.
- Nav links: 1px underline scales in from the right origin and out to the left, 0.5s.
- Mobile (390): cards stack (thumb + date + city, stub below), no tilt, "tap to tear".
- Reduced motion: transitions collapse to ~0s, float and reveals are disabled.

Captures live outside the repository (third-party imagery is not committed).
