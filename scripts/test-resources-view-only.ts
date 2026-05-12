const { readFileSync } = require("fs");
const { join } = require("path");

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf-8");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const resourceViewer = read("src/app/(public)/resources/view/[id]/page.tsx");
const resourceSlot = read("src/components/resource-pdf-slot.tsx");
const securePdf = read("src/components/secure-pdf-renderer.tsx");
const securePdfDesktop = read("src/components/secure-pdf-renderer-desktop.tsx");
const apiRoute = read("src/app/api/view-resource/route.ts");
const resourcesHub = read("src/components/resources-hub.tsx");
const sixHourBanner = read("src/components/six-hour-plan-banner.tsx");
const fiveDayBanner = read("src/components/five-day-plan-banner.tsx");
const paper1ChecklistBanner = read("src/components/paper1-checklist-banner.tsx");
const resourceSupplements = read("src/lib/resource-supplements.ts");

for (const [name, source] of [
  ["resource viewer", resourceViewer],
  ["resource slot", resourceSlot],
  ["secure pdf mobile renderer", securePdf],
  ["secure pdf desktop renderer", securePdfDesktop],
  ["resources hub", resourcesHub],
  ["six hour plan banner", sixHourBanner],
  ["five day plan banner", fiveDayBanner],
  ["paper 1 checklist banner", paper1ChecklistBanner],
]) {
  assert(!/\sdownload(?:=|\s|>)/i.test(source), `${name} must not render download attributes or actions`);
  assert(!/target=["']_blank["']/.test(source), `${name} must not open resource files in a new tab`);
  assert(!/Open in new tab/i.test(source), `${name} must not expose raw-file new-tab actions`);
}

assert(
  resourceSlot.includes("SecurePdfRenderer") && resourceSlot.includes("<Image") && resourceSlot.includes("<iframe"),
  "resource slot must cover PDF resources plus non-PDF image and text-like previews"
);
assert(resourceSlot.includes("/api/view-resource?id="), "resource slot must route file previews through the inline API");
assert(
  securePdf.includes("/api/view-resource?id=") && !securePdf.includes("startsWith(\"http\")"),
  "mobile PDF rendering must use the inline API instead of raw resource URLs"
);
assert(
  securePdfDesktop.includes("/api/view-resource?id=") && !securePdfDesktop.includes("download"),
  "desktop PDF rendering must use the inline API without download controls"
);
assert(
  apiRoute.includes("Content-Disposition") && apiRoute.includes("inline") && !apiRoute.includes("Response.redirect"),
  "view-resource API must force inline responses and must not redirect to raw storage URLs"
);
assert(
  apiRoute.includes("toAbsoluteSignedUrl") && apiRoute.includes("/storage/v1"),
  "view-resource API must build absolute Supabase signed URLs under /storage/v1"
);
assert(
  apiRoute.includes("SUPABASE_SERVICE_ROLE_KEY") && apiRoute.includes("SUPABASE_BUCKET_NAME"),
  "view-resource API must support server-only Supabase env vars and the existing bucket env alias"
);
assert(apiRoute.includes("Range") && apiRoute.includes("Content-Range"), "view-resource API must support range requests");
assert(
  !apiRoute.includes(".download(") && !apiRoute.includes("storage.download"),
  "view-resource API must not call Supabase download APIs"
);
assert(
  sixHourBanner.includes("/resources/view/six-hour-plan") &&
    fiveDayBanner.includes("/resources/view/five-day-plan-paper-1"),
  "Resources plan banners must open through in-app viewer pages"
);
assert(
  resourceSupplements.includes("id: \"six-hour-plan\"") &&
    resourceSupplements.includes("id: \"five-day-plan-paper-1\""),
  "Resources plan PDFs must be registered as viewable resources"
);
assert(
  !paper1ChecklistBanner.includes("storage/v1/object/public/resources") &&
    !paper1ChecklistBanner.includes("window.open"),
  "Resources checklist rewards must not expose public storage URLs or new-tab fallbacks"
);
console.log("Resources view-only regression checks passed.");
