#!/usr/bin/env node
/**
 * Targeted E2E for the M/J 2026 results showcase (homepage + /results).
 *
 *   PW_MODULE=<path-to-playwright> BASE_URL=http://localhost:3000 OUT=./qa node scripts/results/e2e-mj26-results.mjs
 *
 * Playwright is not a dependency of this site; point PW_MODULE at any installed
 * copy (or `npx -y playwright@1.62.1 install chromium` and use that package).
 * Verifies: three rows / directions / px-per-second pacing, seamless-loop
 * geometry, hover + focus + dialog pause/resume, dialog a11y (focus trap,
 * Escape, focus restore, 44px close), reduced motion, no page-level horizontal
 * overflow at 320–1440, and writes screenshots to OUT for the readability gate.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const pwPath = process.env.PW_MODULE || "playwright";
const { chromium } = await import(pwPath);
const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.OUT || "qa";
fs.mkdirSync(OUT, { recursive: true });

let failed = 0;
const check = (label, ok, extra = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failed++;
};
const trackState = () =>
  [...document.querySelectorAll("[data-results-track]")].map((t) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(t).transform);
    const seg = t.querySelector("[data-results-segment]");
    const tail = t.querySelector("[data-results-tail]");
    return {
      dir: t.dataset.direction,
      px: Number(t.dataset.pxPerSecond),
      seg: seg.offsetWidth,
      tail: tail.offsetWidth,
      loop: parseFloat(t.style.getPropertyValue("--results-loop")),
      track: t.offsetWidth,
      x: m.m41,
      play: getComputedStyle(t).animationPlayState,
      name: getComputedStyle(t).animationName,
      paused: t.dataset.paused,
      dupHidden: getComputedStyle(t.querySelector("[data-dup]")).display === "none",
    };
  });

const browser = await chromium.launch();

/** Index + centre of the first non-duplicate capsule of a row inside the central reading zone. */
const visibleCapsule = (row) => {
  const caps = [...document.querySelectorAll(`[data-results-row='${row}'] [data-result-capsule]:not([data-dup])`)];
  // Reading zone: capsule centre well inside the viewport and clear of the edge fades.
  const lo = innerWidth * (innerWidth < 640 ? 0.2 : 0.3), hi = innerWidth * (innerWidth < 640 ? 0.8 : 0.7);
  for (let i = 0; i < caps.length; i++) {
    const r = caps[i].getBoundingClientRect();
    const cx = r.left + r.width / 2;
    if (cx >= lo && cx <= hi && r.top >= 0 && r.bottom <= innerHeight) return { i, x: cx, y: r.top + r.height / 2, h: r.height };
  }
  return null;
};

async function run(name, viewport, opts = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...(opts.context || {}) });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  // Third-party (AdSense) report-only CSP notices are not ours; everything else counts.
  page.on("console", (m) => { if (m.type() === "error" && !/Content Security Policy|googlesyndication|google\.com/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !!document.querySelector("[data-results-track]")?.dataset.pxPerSecond);
  const sw = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, bsw: document.body.scrollWidth }));
  check(`${name}: no page-level horizontal overflow`, sw.sw <= sw.iw && sw.bsw <= sw.iw, JSON.stringify(sw));
  await page.evaluate(() => document.getElementById("results").scrollIntoView({ behavior: "instant", block: "start" }));
  await page.waitForTimeout(300);
  const offscreenPaused = await page.evaluate(() => [...document.querySelectorAll("[data-results-track]")].map((t) => t.dataset.paused));
  const rowsBelowFold = await page.evaluate(() => document.querySelector("[data-results-rows]").getBoundingClientRect().top > innerHeight - 40);
  check(`${name}: rows are offloaded while offscreen`, !rowsBelowFold || offscreenPaused.every((p) => p === "true"), `belowFold=${rowsBelowFold} paused=${offscreenPaused}`);
  const centerRows = () => page.evaluate(() => document.querySelector("[data-results-rows]").scrollIntoView({ behavior: "instant", block: "center" }));
  await centerRows();
  await page.waitForTimeout(400);
  const s0 = await page.evaluate(trackState);
  check(`${name}: three rows, directions left/right/left`, s0.length === 3 && s0.map((t) => t.dir).join() === "left,right,left");
  check(`${name}: loop distance = full segment, tail copy wider than the viewport (seamless geometry)`, s0.every((t) => Math.abs(t.loop - t.seg) <= 1 && t.tail >= viewport.width && Math.abs(t.track - t.seg - t.tail) <= 2), s0.map((t) => `seg ${t.seg} tail ${t.tail}`).join(" "));
  check(`${name}: rows running when visible`, s0.every((t) => t.play === "running" && t.paused === "false"));
  await page.waitForTimeout(2000);
  const s1 = await page.evaluate(trackState);
  const measured = s1.map((t, i) => Math.abs(t.x - s0[i].x) / 2);
  const [lo, hi] = opts.speedRange;
  check(`${name}: measured speed within ${lo}–${hi} px/s`, measured.every((v) => v >= lo - 1 && v <= hi + 1), measured.map((v) => v.toFixed(1)).join(" / ") + ` (targets ${s1.map((t) => t.px).join(" / ")})`);
  check(`${name}: measured ≈ target (±10%)`, measured.every((v, i) => Math.abs(v - s1[i].px) <= s1[i].px * 0.1));
  await page.screenshot({ path: path.join(OUT, `${name}-results-a.png`) });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, `${name}-results-b.png`) });

  // Hover pause (pointer devices only)
  await centerRows();
  await page.waitForTimeout(200);
  if (!opts.touch) {
    const v = await page.evaluate(visibleCapsule, 1);
    check(`${name}: a capsule sits in the central reading zone`, !!v);
    await page.mouse.move(v.x, v.y);
    await page.waitForTimeout(200);
    const h = await page.evaluate(trackState);
    check(`${name}: hover pauses only that row`, h[0].play === "paused" && h[1].play === "running");
    const xBefore = h[0].x;
    await page.waitForTimeout(600);
    const h2 = await page.evaluate(trackState);
    check(`${name}: paused row does not move`, Math.abs(h2[0].x - xBefore) < 0.5);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300);
    const h3 = await page.evaluate(trackState);
    check(`${name}: resumes from the same position (no restart)`, h3[0].play === "running" && Math.abs(h3[0].x - xBefore) < 28 * 0.6);
  }

  // Focus pause + keyboard open/close
  // Row 2 moves right: its real segment starts offscreen, so focusing its first
  // capsule must seek the row until that capsule is inside the reading zone.
  const first = page.locator("[data-results-row='2'] [data-result-capsule]:not([data-dup])").first();
  await first.focus();
  await page.waitForTimeout(150);
  const f = await page.evaluate(trackState);
  check(`${name}: keyboard focus pauses the focused row`, f[1].play === "paused");
  const inBand = await first.evaluate((el) => { const r = el.getBoundingClientRect(); const row = el.closest(".results-row").getBoundingClientRect(); return r.left >= row.left - 2 && r.right <= row.right && r.width > 0; });
  check(`${name}: focused capsule is brought into the visible band`, inBand);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(100);
  const inBand2 = await page.evaluate(() => { const el = document.activeElement; const r = el.getBoundingClientRect(); const row = el.closest(".results-row").getBoundingClientRect(); return el.matches("[data-result-capsule]") && r.left >= row.left && r.right <= row.right; });
  check(`${name}: Tab moves to the next capsule and keeps it visible`, inBand2);
  await page.keyboard.press("Shift+Tab");
  await page.waitForTimeout(100);
  const ring = await first.evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).outlineWidth);
  check(`${name}: visible focus ring`, /solid/.test(ring) && !/0px/.test(ring), ring);
  await page.keyboard.press("Enter");
  const dialog = page.locator("[role='dialog']");
  await dialog.waitFor({ state: "visible" });
  await page.waitForTimeout(300); // let the open transition finish before measuring
  const label = await first.evaluate((el) => el.querySelector(".results-capsule-name").textContent);
  const title = await dialog.locator("h2").first().textContent();
  check(`${name}: Enter opens detail for the focused capsule`, label === title.trim(), `${title} ← ${label.slice(0, 40)}`);
  const d = await page.evaluate(() => {
    const dlg = document.querySelector("[role='dialog']");
    const c = dlg.querySelector("[aria-label='Close result']").getBoundingClientRect();
    const r = dlg.getBoundingClientRect();
    return { close: [c.width, c.height], fits: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, inside: dlg.contains(document.activeElement), text: dlg.textContent };
  });
  check(`${name}: dialog fits viewport, close target ≥ 44px`, d.fits && d.close[0] >= 44 && d.close[1] >= 44, `close ${d.close.join("×")}`);
  check(`${name}: dialog shows only public-safe fields`, /shared with/i.test(d.text) && !/@|WhatsApp|drive\.google/.test(d.text));
  const dp = await page.evaluate(trackState);
  check(`${name}: all rows pause while dialog is open`, dp.every((t) => t.play === "paused"));
  const lock = await page.evaluate(() => { const y = scrollY; window.scrollBy(0, 200); const moved = scrollY !== y; window.scrollTo(0, y); return { moved, overflow: getComputedStyle(document.documentElement).overflow }; });
  check(`${name}: page scroll locked behind the dialog`, !lock.moved, JSON.stringify(lock));
  const trail = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    trail.push(await page.evaluate(() => { const a = document.activeElement; const d = document.querySelector("[role='dialog']"); return (d.contains(a) ? "in:" : "OUT:") + a.tagName + (a.getAttribute("aria-label") ? "/" + a.getAttribute("aria-label") : "") + (a.getAttribute("data-base-ui-focus-guard") !== null ? "/guard" : ""); }));
  }
  const trapped = trail.every((t) => t.startsWith("in:"));
  check(`${name}: focus trapped inside dialog`, trapped, trail.join(" → "));
  await page.screenshot({ path: path.join(OUT, `${name}-dialog.png`) });
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  const restored = await page.evaluate(() => document.activeElement?.querySelector?.(".results-capsule-name")?.textContent);
  check(`${name}: Escape closes and focus returns to the opening capsule`, restored === label);
  await page.mouse.move(5, 5);
  await first.blur();
  await page.waitForTimeout(300);
  const after = await page.evaluate(trackState);
  check(`${name}: rows resume after close`, after.every((t) => t.play === "running"));
  const rowScroll = await page.evaluate(() => [...document.querySelectorAll(".results-row")].map((r) => r.scrollLeft));
  check(`${name}: rows never scroll (overflow: clip)`, rowScroll.every((x) => x === 0), rowScroll.join(","));

  // Tap (touch) open
  if (opts.touch) {
    await centerRows();
    await page.waitForTimeout(200);
    const v3 = await page.evaluate(visibleCapsule, 3);
    check(`${name}: a capsule sits in the central reading zone (row 3)`, !!v3);
    await page.touchscreen.tap(v3.x, v3.y);
    await dialog.waitFor({ state: "visible" });
    check(`${name}: tap opens detail`, true);
    await page.screenshot({ path: path.join(OUT, `${name}-dialog-tap.png`) });
    await page.locator("[aria-label='Close result']").tap();
    await dialog.waitFor({ state: "hidden" });
    check(`${name}: close button closes`, true);
    check(`${name}: capsule tap target ≥ 44px`, v3.h >= 44, `${v3.h.toFixed(0)}px`);
  }
  check(`${name}: no console/page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
  await context.close();
}

await run("desktop-1440", { width: 1440, height: 900 }, { speedRange: [26, 32] });
await run("laptop-1280", { width: 1280, height: 800 }, { speedRange: [26, 32] });
await run("tablet-768", { width: 768, height: 1024 }, { speedRange: [22, 28] });
await run("mobile-390", { width: 390, height: 844 }, { speedRange: [18, 24], touch: true, context: { hasTouch: true, isMobile: true } });
await run("mobile-375", { width: 375, height: 812 }, { speedRange: [18, 24], touch: true, context: { hasTouch: true, isMobile: true } });
await run("mobile-320", { width: 320, height: 568 }, { speedRange: [18, 24], touch: true, context: { hasTouch: true, isMobile: true } });

// Reduced motion
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.getElementById("results").scrollIntoView({ behavior: "instant" }));
  const rm = await page.evaluate(() => {
    const tracks = [...document.querySelectorAll("[data-results-track]")];
    const visibleCaps = [...document.querySelectorAll("[data-result-capsule]:not([data-dup])")].filter((b) => b.getClientRects().length > 0).length;
    return {
      anim: tracks.map((t) => getComputedStyle(t).animationName),
      dupHidden: tracks.every((t) => getComputedStyle(t.querySelector("[data-dup]")).display === "none"),
      wraps: tracks.every((t) => t.offsetWidth <= innerWidth),
      visibleCaps,
      total: document.querySelectorAll("[data-result-capsule]:not([data-dup])").length,
    };
  });
  check("reduced motion: marquee disabled, static grid, duplicates hidden", rm.anim.every((a) => a === "none") && rm.dupHidden && rm.wraps, JSON.stringify(rm.anim));
  check("reduced motion: every result still rendered and reachable", rm.visibleCaps === rm.total && rm.total === 293, `${rm.visibleCaps}/${rm.total}`);
  const first = page.locator("[data-result-capsule]:not([data-dup])").first();
  await first.click();
  await page.locator("[role='dialog']").waitFor({ state: "visible" });
  check("reduced motion: detail interaction retained", true);
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(OUT, "reduced-motion.png") });
  await context.close();
}

// /results page
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const res = await page.goto(`${BASE}/results`, { waitUntil: "networkidle" });
  check("/results: 200", res.status() === 200);
  const h1s = await page.evaluate(() => ({ h1: document.querySelectorAll("h1").length, h2: [...document.querySelectorAll("h2")].map((h) => h.textContent.trim().slice(0, 30)), archive: document.querySelectorAll("ul[aria-label] [data-result-capsule]").length, method: !!document.getElementById("methodology") }));
  check("/results: archive lists all 293 results statically + methodology section", h1s.archive === 293 && h1s.method, JSON.stringify(h1s));
  check("/results: exactly one h1 (Our Results)", h1s.h1 === 1);
  await page.locator("button[aria-pressed]", { hasText: "A*" }).click();
  const filtered = await page.evaluate(() => document.querySelectorAll("ul[aria-label] [data-result-capsule]").length);
  check("/results: grade filter works (A* = 134)", filtered === 134, String(filtered));
  await page.screenshot({ path: path.join(OUT, "results-page.png"), fullPage: false });
  await page.evaluate(() => document.getElementById("methodology").scrollIntoView({ behavior: "instant" }));
  await page.screenshot({ path: path.join(OUT, "results-methodology.png") });
  await context.close();
}

await browser.close();
if (failed) { console.error(`\n${failed} E2E check(s) failed`); process.exit(1); }
console.log("\nAll M/J 2026 results E2E checks passed.");
