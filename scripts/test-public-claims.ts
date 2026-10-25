import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { socialMetadata } from "../src/lib/seo";
import {
  getBatchAnnouncement,
  isBatchAnnouncementActive,
} from "../src/lib/public-experience";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|json|md)$/.test(name) ? [path] : [];
  });
}

// Spelling Bee is an LMS-only event: it must not be advertised on the public site.
const hidden = /spelling[\s-]*bee/i;
for (const file of sourceFiles("src"))
  assert(!hidden.test(readFileSync(file, "utf8")), `Spelling Bee in ${file}`);

// A standing "Enrolment Open" badge is a claim; it may render only inside the dated batch window.
const hero = readFileSync("src/components/live-session-hero.tsx", "utf8");
assert.match(hero, /\{enrolmentOpen && \(/);
const home = readFileSync("src/app/(public)/page.tsx", "utf8");
assert.match(home, /enrolmentOpen=\{isBatchAnnouncementActive\(\)\}/);
const after = new Date("2026-10-25T12:00:00+05:00");
assert(!isBatchAnnouncementActive(after));
const expired = getBatchAnnouncement(after);
assert(
  !/after 15 october|join the new batch|open|deadline/i.test(
    expired.message + expired.cta,
  ),
);

// Page-level openGraph replaces the root one, so each helper output must carry the image and its own URL.
const meta = socialMetadata({ title: "T", description: "D", path: "/x" });
assert.equal((meta.openGraph as { url: string }).url, "/x");
assert.equal((meta.openGraph as { images: unknown[] }).images.length, 1);
assert.deepEqual((meta.twitter as { images: string[] }).images, [
  "/opengraph-image.png",
]);

console.log("public claims tests passed");
