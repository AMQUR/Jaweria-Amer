import assert from "node:assert/strict";
import { createRequire } from "node:module";
import Module from "node:module";
import { inflateRawSync } from "node:zlib";
import { readFileSync } from "node:fs";

// Next bundles the server-only marker; map it to its empty marker for Node test execution only.
const require = createRequire(import.meta.url);
const internals = Module as unknown as {
  _resolveFilename: (id: string, ...args: unknown[]) => string;
};
const originalResolve = internals._resolveFilename;
internals._resolveFilename = function (id, ...args) {
  return id === "server-only"
    ? require.resolve("next/dist/compiled/server-only/empty.js")
    : originalResolve.call(this, id, ...args);
};

/** Read a stored (uncompressed) or deflated entry out of a zip buffer. */
function unzip(buffer: Buffer): Record<string, string> {
  const files: Record<string, string> = {};
  let offset = 0;
  while (buffer.readUInt32LE(offset) === 0x04034b50) {
    const method = buffer.readUInt16LE(offset + 8);
    const size = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const name = buffer.toString("utf8", offset + 30, offset + 30 + nameLength);
    const start = offset + 30 + nameLength + extraLength;
    const data = buffer.subarray(start, start + size);
    files[name] = (method === 0 ? data : inflateRawSync(data)).toString("utf8");
    offset = start + size;
  }
  return files;
}

const enquiry = {
  name: 'Sam <b>"Test"</b>',
  email: "sam@example.com",
  course: "O Level English Language 1123" as const,
  batch: "B" as const,
};

async function main() {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  const originalError = console.error;
  const originalInfo = console.info;
  const logged: string[] = [];
  console.error = (...args: unknown[]) => void logged.push(args.join(" "));
  console.info = (...args: unknown[]) => void logged.push(args.join(" "));
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.SESSION_SECRET = "test-registration-secret-at-least-32-characters";
  try {
    const { notifyTeacherOfEnquiry, notifyBudget, resetNotifyState } =
      await import("../src/lib/registration/notify");
    const { enquiriesToXlsx, ENQUIRY_HEADERS } = await import(
      "../src/lib/registration/export"
    );
    notifyBudget.backoffMs = [1, 1];
    notifyBudget.attemptMs = 200;

    const stored = [
      {
        id: "1",
        name: "=HYPERLINK(\"http://evil\")",
        email: "+danger@example.com",
        course: "IGCSE English as a First Language 0500",
        created_at: "2026-11-02T09:00:00Z",
        batch_letter: null,
        destination_name: null,
        routing_status: "received",
      },
      {
        id: "2",
        name: "Aisha & Co <x>",
        email: "aisha@example.com",
        course: "O Level English Language 1123",
        created_at: "2026-11-01T09:00:00Z",
        batch_letter: "A",
        destination_name: null,
        routing_status: "needs_review",
      },
    ];
    type Call = { url: string; headers: Headers; body: Record<string, unknown> };
    let resendCalls: Call[] = [];
    let resendReplies: Array<number | "throw" | "hang"> = [];
    let sheetAvailable = true;
    globalThis.fetch = async (url, options) => {
      if (String(url).includes("/rpc/list_registration_interest_page"))
        return Response.json({ code: "PGRST202" }, { status: 404 });
      if (String(url).includes("/rpc/list_registration_interest")) {
        if (!sheetAvailable) return Response.json({}, { status: 500 });
        return Response.json(stored);
      }
      assert.equal(String(url), "https://api.resend.com/emails");
      resendCalls.push({
        url: String(url),
        headers: new Headers(options?.headers),
        body: JSON.parse(String(options?.body)),
      });
      const next = resendReplies.shift() ?? 200;
      if (next === "throw") throw new TypeError("network down");
      if (next === "hang") return new Promise<Response>(() => undefined);
      return Response.json({ id: "email_1" }, { status: next });
    };
    const reset = () => {
      resetNotifyState();
      resendCalls = [];
      resendReplies = [];
      logged.length = 0;
      sheetAvailable = true;
    };

    // 1. Provider not configured: nothing is sent, nothing throws.
    reset();
    delete process.env.RESEND_API_KEY;
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-0"), "not_configured");
    assert.equal(resendCalls.length, 0);

    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "Website <enquiries@example.org>";
    process.env.REGISTRATION_NOTIFY_EMAIL = "teacher@example.org";

    // 2. Misconfigured recipient is refused before any request.
    reset();
    process.env.REGISTRATION_NOTIFY_EMAIL = "not an address";
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-bad"), "invalid_recipient");
    assert.equal(resendCalls.length, 0);
    process.env.REGISTRATION_NOTIFY_EMAIL = "teacher@example.org";

    // 3. Happy path: one message, to the configured teacher only, escaped, with the sheet.
    reset();
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-1"), "sent");
    assert.equal(resendCalls.length, 1);
    const sent = resendCalls[0];
    assert.equal(sent.headers.get("authorization"), "Bearer re_test_key");
    assert.equal(sent.headers.get("idempotency-key"), "enquiry-req-1");
    assert.deepEqual(sent.body.to, ["teacher@example.org"]);
    assert.equal(sent.body.from, "Website <enquiries@example.org>");
    assert.equal(sent.body.reply_to, "sam@example.com");
    assert(!("cc" in sent.body) && !("bcc" in sent.body));
    const html = String(sent.body.html);
    assert(!html.includes("<b>\"Test\"</b>"), "visitor HTML must be escaped");
    assert(html.includes("&#60;b&#62;"));
    assert(html.includes("Batch B"));
    assert(html.includes("not a confirmed enrollment"));
    assert(!/[\r\n]/.test(String(sent.body.subject)));
    const attachments = sent.body.attachments as { filename: string; content: string }[];
    assert.equal(attachments.length, 1);
    assert.match(attachments[0].filename, /^enquiries-\d{4}-\d{2}-\d{2}\.xlsx$/);

    // 3b. The notice recaps earlier enquiries, so a missed notice surfaces with the next one,
    //     and the provider's message id is logged against the enquiry's request id.
    assert(html.includes("Previous enquiries"));
    assert(html.includes("Aisha &#38; Co &#60;x&#62;"));
    assert(html.includes("(2 enquiries)"));
    assert(logged.some((l) => l.includes("notify accepted req-1 email_1")));

    // 4. Duplicate prevention: the same enquiry never produces a second request…
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-1"), "duplicate");
    assert.equal(resendCalls.length, 1);
    // …and two overlapping calls for one enquiry send once.
    reset();
    const pair = await Promise.all([
      notifyTeacherOfEnquiry(enquiry, "req-race"),
      notifyTeacherOfEnquiry(enquiry, "req-race"),
    ]);
    assert.deepEqual([...pair].sort(), ["duplicate", "sent"]);
    assert.equal(resendCalls.length, 1);

    // 5. Retries: network error, then 500, then success — same idempotency key each time.
    reset();
    resendReplies = ["throw", 500, 200];
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-2"), "sent");
    assert.equal(resendCalls.length, 3);
    assert(resendCalls.every((c) => c.headers.get("idempotency-key") === "enquiry-req-2"));

    // 6. Rate limited then a hung request (capped), then success.
    reset();
    resendReplies = [429, "hang", 200];
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-3"), "sent");
    assert.equal(resendCalls.length, 3);

    // 7. Retries are bounded, and a later attempt for the same enquiry may try again.
    reset();
    resendReplies = [503, 503, 503, 200];
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-4"), "failed");
    assert.equal(resendCalls.length, 3);
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-4"), "sent");
    assert.equal(resendCalls[3].headers.get("idempotency-key"), "enquiry-req-4");

    // 8. A configuration rejection (4xx) is not retried.
    reset();
    resendReplies = [403];
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-5"), "rejected");
    assert.equal(resendCalls.length, 1);

    // 9. If the sheet cannot be built the notice still goes out, without an attachment.
    reset();
    sheetAvailable = false;
    assert.equal(await notifyTeacherOfEnquiry(enquiry, "req-6"), "sent");
    assert.deepEqual(resendCalls[0].body.attachments, []);

    // 10. Logs never contain a name, an address or the API key.
    reset();
    resendReplies = [500, 500, 500];
    await notifyTeacherOfEnquiry(enquiry, "req-7");
    resendReplies = [401];
    await notifyTeacherOfEnquiry(enquiry, "req-8");
    const logText = logged.join("\n");
    assert(logged.length >= 2);
    for (const secret of ["sam@example.com", "Sam", "teacher@example.org", "re_test_key"])
      assert(!logText.includes(secret), `log leaked ${secret}`);

    // 11. Excel export: a real .xlsx package, oldest first, formulas neutralised, XML escaped.
    const workbook = enquiriesToXlsx(stored);
    assert.equal(workbook.readUInt32LE(0), 0x04034b50);
    const parts = unzip(workbook);
    for (const part of [
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/workbook.xml",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/worksheets/sheet1.xml",
    ])
      assert(parts[part], `missing ${part}`);
    const sheet = parts["xl/worksheets/sheet1.xml"];
    for (const header of ENQUIRY_HEADERS) assert(sheet.includes(`>${header}<`));
    assert.equal((sheet.match(/<row /g) ?? []).length, 3);
    assert(sheet.indexOf("Aisha") < sheet.indexOf("HYPERLINK"), "oldest enquiry first");
    assert(sheet.includes(">&apos;=HYPERLINK") || sheet.includes(">'=HYPERLINK"));
    assert(sheet.includes(">'+danger@example.com<"));
    assert(sheet.includes("Aisha &amp; Co &lt;x&gt;"));
    assert(!sheet.includes("<x>"));
    assert(sheet.includes("Needs review"));

    // 11b. Characters XML 1.0 forbids are dropped, so one hostile name cannot corrupt the sheet.
    const hostile = enquiriesToXlsx([
      {
        ...stored[1],
        name: "Bad\u0000\u000B\uFFFE\uFFFF\uD800Name \u{1F600} ok",
        email: "ok@example.com",
      },
    ]);
    const hostileSheet = unzip(hostile)["xl/worksheets/sheet1.xml"];
    assert(hostileSheet.includes("BadName \u{1F600} ok"));
    for (const bad of ["\u0000", "\u000B", "\uFFFE", "\uFFFF", "\uD800"])
      assert(!hostileSheet.includes(bad), "XML-invalid character survived");

    // 11c. The admin list may be far larger than a save reply; it must not be cut mid-JSON.
    const { listRegistrations } = await import("../src/lib/registration/server");
    const many = Array.from({ length: 200 }, (_, i) => ({
      ...stored[1],
      id: String(i),
      name: `Student ${i} ${"x".repeat(60)}`,
    }));
    assert(JSON.stringify(many).length > 8192 * 4);
    globalThis.fetch = async () => Response.json(many);
    assert.equal((await listRegistrations()).length, 200);
    globalThis.fetch = async () => Response.json({ not: "a list" });
    await assert.rejects(listRegistrations());

    // 11d. Full export. Without the paginated function it falls back to the newest 200
    //      and says so; it never passes a capped list off as complete.
    const { listAllRegistrations } = await import("../src/lib/registration/server");
    const { INCOMPLETE_NOTICE, enquiryFilename } = await import(
      "../src/lib/registration/export"
    );
    const lead = (i: number) => ({
      ...stored[1],
      id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      name: `Student ${i}`,
      created_at: new Date(Date.UTC(2026, 9, 1) + i * 60_000).toISOString(),
    });
    globalThis.fetch = async (url) =>
      String(url).includes("_page")
        ? Response.json({ code: "PGRST202" }, { status: 404 })
        : Response.json(Array.from({ length: 200 }, (_, i) => lead(i)));
    const capped = await listAllRegistrations();
    assert.deepEqual([capped.source, capped.complete, capped.leads.length], ["legacy", false, 200]);
    const cappedSheet = unzip(enquiriesToXlsx(capped.leads, { complete: capped.complete }))[
      "xl/worksheets/sheet1.xml"
    ];
    assert(cappedSheet.includes(INCOMPLETE_NOTICE));
    assert.match(enquiryFilename(new Date("2026-11-11"), false), /latest-200/);
    globalThis.fetch = async (url) =>
      String(url).includes("_page")
        ? Response.json({ code: "PGRST202" }, { status: 404 })
        : Response.json(Array.from({ length: 150 }, (_, i) => lead(i)));
    const small = await listAllRegistrations();
    assert.deepEqual([small.complete, small.leads.length], [true, 150]);
    assert(!unzip(enquiriesToXlsx(small.leads, { complete: true }))["xl/worksheets/sheet1.xml"].includes("NOTE:"));
    // With the paginated function present it walks every page by keyset and is complete.
    const all = Array.from({ length: 1200 }, (_, i) => lead(i)).reverse(); // newest first
    const pageCalls: Array<Record<string, unknown>> = [];
    globalThis.fetch = async (url, options) => {
      assert(String(url).includes("/rpc/list_registration_interest_page"));
      const args = JSON.parse(String(options?.body));
      pageCalls.push(args);
      const start = args.before_id ? all.findIndex((l) => l.id === args.before_id) + 1 : 0;
      return Response.json(all.slice(start, start + args.page_size));
    };
    const paged = await listAllRegistrations();
    assert.deepEqual([paged.source, paged.complete, paged.leads.length], ["paged", true, 1200]);
    assert.equal(new Set(paged.leads.map((l) => l.id)).size, 1200);
    assert.equal(pageCalls.length, 3);
    assert.equal(pageCalls[0].before_id, null);
    assert.equal(pageCalls[1].before_created_at, all[499].created_at);
    // A failing paginated call (not "missing") is an error, not a silent downgrade.
    globalThis.fetch = async () => Response.json({}, { status: 500 });
    await assert.rejects(listAllRegistrations());
    const proposed = readFileSync("supabase/proposed/paginated_registration_list.sql", "utf8");
    assert(proposed.includes("NOT APPLIED") && !/\b(alter|drop|delete|insert|update)\b/i.test(proposed.replace(/^--.*$/gm, "")));

    // 12. Export route: no session, no data. With a session, a private no-store download.
    const { GET } = await import("../src/app/api/admin/registrations/export/route");
    const denied = await GET();
    assert.equal(denied.status, 401);
    assert.equal(denied.headers.get("cache-control"), "no-store, private");
    assert(!(await denied.text()).includes("example.com"));

    // 13. Wiring: only a confirmed save notifies; the export sits behind the admin guard.
    const route = readFileSync("src/app/api/registration/route.ts", "utf8");
    const savedBranch = route.slice(
      route.indexOf('outcome.status === "saved"'),
      route.indexOf('outcome.status === "timeout"'),
    );
    assert(savedBranch.includes("notifyTeacherOfEnquiry"));
    assert.equal(route.split("notifyTeacherOfEnquiry").length - 1, 2, "import + one call site");
    assert(readFileSync("src/proxy.ts", "utf8").includes('"/api/admin/:path*"'));

    console.log(
      "Registration notify contracts passed: unconfigured skip, recipient check, single send, idempotency key, overlap dedupe, bounded retries, no retry on 4xx, attachment fallback, PII-free logs, valid escaped xlsx, guarded export.",
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
    console.error = originalError;
    console.info = originalInfo;
    internals._resolveFilename = originalResolve;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
