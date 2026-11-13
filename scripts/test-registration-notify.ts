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
  phone: "+923001234567",
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
        phone: null, // historical enquiry saved before phone numbers were collected
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
        phone: "+442079460958",
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
    assert(html.includes("<b>Phone / WhatsApp:</b> +923001234567"), "phone in the enquiry email");
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
    for (const secret of ["sam@example.com", "Sam", "teacher@example.org", "re_test_key", "923001234567", "442079460958"])
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
    // Phone column: header between Email and Course, value stored as text with the + intact,
    // historical NULL left blank, and a "Text" (@) format on the column.
    assert.deepEqual([...ENQUIRY_HEADERS].slice(0, 4), ["Name", "Email", "Phone / WhatsApp", "Course"]);
    assert.equal(ENQUIRY_HEADERS.length, 7);
    assert(sheet.includes('<c r="C2" t="inlineStr" s="2"><is><t xml:space="preserve">+442079460958</t>'), "phone is an inline text cell");
    assert(sheet.includes('<c r="C3" t="inlineStr" s="2"><is><t xml:space="preserve"></t>'), "historical NULL phone is blank");
    assert(parts["xl/styles.xml"].includes('numFmtId="49"'), "text number format present");
    assert(!sheet.includes("<f>"), "no formula cells");
    // A stored value that is not a plain number is still formula-neutralised.
    const odd = unzip(enquiriesToXlsx([{ ...stored[1], phone: "=1+1" }]))["xl/worksheets/sheet1.xml"];
    assert(odd.includes(">'=1+1<"));

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
    const phoneMigration = readFileSync("supabase/migrations/20261113010000_registration_phone.sql", "utf8");
    assert(/add column if not exists phone text;/i.test(phoneMigration), "phone column is nullable");
    assert(!/phone text not null|set not null|drop (table|column)|delete from registration_private\.leads\s*;|update registration_private\.leads\s+set phone/i.test(phoneMigration.replace(/--.*$/gm, "")), "phone migration is additive and invents nothing");
    assert(phoneMigration.includes("student_phone !~"), "new enquiries must carry a valid phone");
    assert(phoneMigration.includes("interval '180 days'"), "retention rule unchanged");
    assert(/grant execute on function public\.submit_registration_interest_v2[^;]*to service_role/.test(phoneMigration));
    assert(!/to (anon|authenticated|public)/.test(phoneMigration.replace(/--.*$/gm, "")), "functions are not granted to public roles");
    const migration = readFileSync("supabase/migrations/20261111020000_registration_notification_outbox.sql", "utf8");
    assert(migration.includes("list_registration_interest_page") && migration.includes("claim_registration_notifications"));
    assert(!/drop (table|column)|delete from registration_private\.leads/i.test(migration), "migration is additive");

    // 11e. Durable path: the protected claim returns the phone and the email carries it.
    {
      reset();
      const { processEnquiryNotifications } = await import("../src/lib/registration/notify");
      const rpcCalls: string[] = [];
      const claimed = [
        { id: "a1", name: "Phone Person", email: "pp@example.com", phone: "+923001234567", course: "O Level English Language 1123", created_at: "2026-11-12T09:00:00Z", batch_letter: "A", notify_attempts: 1 },
        { id: "a2", name: "Old Row", email: "old@example.com", phone: null, course: "O Level English Language 1123", created_at: "2026-10-12T09:00:00Z", batch_letter: null, notify_attempts: 1 },
      ];
      globalThis.fetch = async (url, options) => {
        const u = String(url);
        if (u.includes("/rpc/")) rpcCalls.push(u.split("/rpc/")[1]);
        if (u.includes("/rpc/claim_registration_notifications_v2")) return Response.json(claimed);
        if (u.includes("/rpc/finish_registration_notifications")) return Response.json(1);
        if (u.includes("/rpc/list_registration_interest_page_v2")) return Response.json(claimed.map((c) => ({ ...c, destination_name: null, routing_status: "received" })));
        resendCalls.push({ url: u, headers: new Headers(options?.headers), body: JSON.parse(String(options?.body)) });
        return Response.json({ id: "email_dur" });
      };
      const run = await processEnquiryNotifications();
      assert.deepEqual([run.claimed, run.sent, run.failed], [2, 2, 0]);
      assert(rpcCalls.includes("claim_registration_notifications_v2"));
      assert(String(resendCalls[0].body.html).includes("+923001234567"));
      assert(String(resendCalls[1].body.html).includes("<b>Phone / WhatsApp:</b> Not provided"), "NULL phone does not crash the notice");
      assert(resendCalls.every((c) => c.headers.get("idempotency-key")?.startsWith("enquiry-")));
      assert(!logged.join("\n").includes("923001234567"));
    }

    // 12. Export route: no session, no data. With a session, a private no-store download.
    const { GET } = await import("../src/app/api/admin/registrations/export/route");
    const denied = await GET();
    assert.equal(denied.status, 401);
    assert.equal(denied.headers.get("cache-control"), "no-store, private");
    assert(!(await denied.text()).includes("example.com"));

    // 12b. Form, admin inbox and privacy wiring for the phone number.
    const form = readFileSync("src/components/public-experience/registration-form.tsx", "utf8");
    assert(form.includes("WhatsApp / Phone number") && form.includes('type="tel"') && form.includes('autoComplete="tel"') && /name="phone"[\s\S]*required/.test(form));
    assert(form.indexOf('name="email"') < form.indexOf('name="phone"') && form.indexOf('name="phone"') < form.indexOf('name="course"'), "phone sits between email and syllabus");
    const inbox = readFileSync("src/app/admin/(dashboard)/registrations/page.tsx", "utf8");
    assert(inbox.includes("Phone / WhatsApp") && inbox.includes("Not provided") && inbox.includes("requireAuth"));
    assert(/phone/i.test(readFileSync("src/app/(public)/privacy/page.tsx", "utf8")));
    assert(!/trackEvent\([^)]*phone/i.test(form), "phone is never sent to analytics");

    // 13. Wiring: only a confirmed save notifies; the export sits behind the admin guard.
    const route = readFileSync("src/app/api/registration/route.ts", "utf8");
    const savedBranch = route.slice(
      route.indexOf('outcome.status === "saved"'),
      route.indexOf('outcome.status === "timeout"'),
    );
    assert(savedBranch.includes("processEnquiryNotifications"));
    assert.equal(route.split("processEnquiryNotifications").length - 1, 2, "import + one call site");
    const cron = readFileSync("src/app/api/cron/registration-notify/route.ts", "utf8");
    assert(cron.includes("CRON_SECRET") && cron.includes("timingSafeEqual"), "cron is secret-guarded");
    assert(readFileSync("vercel.json", "utf8").includes("/api/cron/registration-notify"));
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
