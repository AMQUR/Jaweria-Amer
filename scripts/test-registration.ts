import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { registrationInput } from "../src/lib/registration/contracts";
import {
  FLOATING_CLEAR_MIN_WIDTH,
  floatingControlsClearRegistration,
  REGISTRATION_PATH,
} from "../src/lib/registration/mobile";
import {
  createSubmissionLock,
  interpretRegistrationFailure,
  interpretRegistrationHttp,
  registrationCopy,
  withTimeout,
} from "../src/lib/registration/outcome";
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
function hangUntilAbort(
  _url: unknown,
  options?: { signal?: AbortSignal | null },
): Promise<Response> {
  return new Promise<Response>((_resolve, reject) => {
    const abort = () =>
      reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
    const signal = options?.signal;
    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
  });
}

async function main() {
  const originalEnv = { ...process.env },
    originalFetch = globalThis.fetch;
  let restoreBudget = () => {};
  try {
    process.env.SESSION_SECRET =
      "test-registration-secret-at-least-32-characters";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-private-key";
    delete process.env.LMS_REGISTRATION_INTENT_URL;
    delete process.env.LMS_REGISTRATION_INTENT_SECRET;
    const {
      createRegistrationTicket,
      registrationBudget,
      verifyRegistrationTicket,
    } = await import("../src/lib/registration/server");
    const budgetSnapshot = { ...registrationBudget };
    restoreBudget = () => Object.assign(registrationBudget, budgetSnapshot);
    const { POST } = await import("../src/app/api/registration/route");
    const { NextRequest } = await import("next/server");
    const now = Date.now();
    const ticket = createRegistrationTicket(now - 3000);
    assert(verifyRegistrationTicket(ticket, now));
    assert.equal(
      verifyRegistrationTicket(ticket.replace(/.$/, "z"), now),
      null,
    );
    assert.equal(
      verifyRegistrationTicket(createRegistrationTicket(now), now),
      null,
    );
    assert.equal(
      verifyRegistrationTicket(createRegistrationTicket(now - 3600001), now),
      null,
    );
    const input = {
      name: "Test student",
      email: " PHASE2@EXAMPLE.INVALID ",
      course: "O Level English Language 1123",
      batch: "A" as const,
      consent: "yes",
      website: "",
      ticket,
    };
    assert.equal(
      registrationInput.parse(input).email,
      "phase2@example.invalid",
    );
    assert(!registrationInput.safeParse({ ...input, website: "spam" }).success);
    assert(!registrationInput.safeParse({ ...input, consent: "no" }).success);
    assert(
      !registrationInput.safeParse({ ...input, course: "invented" }).success,
    );
    assert(!registrationInput.safeParse({ ...input, batch: undefined }).success);
    assert(
      !registrationInput.safeParse({
        ...input,
        course: "IGCSE English as a First Language 0500",
        batch: "C",
      }).success,
    );
    assert(
      registrationInput.safeParse({
        ...input,
        course: "IGCSE English as a Second Language 0510/0511",
        batch: undefined,
      }).success,
    );
    const withCohort = registrationInput.parse({
      ...input,
      cohortId: "11111111-1111-4111-8111-111111111111",
    });
    assert.equal("cohortId" in withCohort, false);
    assert.equal(withCohort.batch, "A");
    const request = (
      body: unknown = input,
      origin = "https://jaweriaamer.com",
      type = "application/json",
    ) =>
      new NextRequest("https://jaweriaamer.com/api/registration", {
        method: "POST",
        headers: {
          origin,
          "Content-Type": type,
          "x-vercel-forwarded-for": "192.0.2.1",
        },
        body: typeof body === "string" ? body : JSON.stringify(body),
      });
    assert.equal(
      (await POST(request(input, "https://evil.example"))).status,
      403,
    );
    assert.equal(
      (await POST(request(input, undefined, "text/plain"))).status,
      415,
    );
    assert.equal((await POST(request({ ...input, name: "" }))).status, 400);
    assert.equal(
      (await POST(request({ ...input, website: "spam" }))).status,
      400,
    );
    assert.equal((await POST(request("x".repeat(5000)))).status, 413);
    assert.equal((await POST(request("{"))).status, 400);
    assert.equal(
      (await POST(request({ ...input, ticket: ticket + "x" }))).status,
      400,
    );
    let writes = 0;
    globalThis.fetch = async (url, options) => {
      writes++;
      assert.equal(
        url,
        "https://example.supabase.co/rest/v1/rpc/submit_registration_interest",
      );
      const body = JSON.parse(String(options?.body));
      assert.equal(body.student_email, "phase2@example.invalid");
      assert.equal(body.batch_letter, "A");
      assert.equal(body.routing_status, "pending_resolution");
      assert.equal(body.destination_name, null);
      assert.equal(body.network_hash.length, 64);
      assert(!String(options?.body).includes("192.0.2.1"));
      return Response.json("saved");
    };
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), {
      saved: true,
      enrollment: "received",
    });
    assert.equal(writes, 1);
    globalThis.fetch = async () => Response.json("limited");
    assert.equal((await POST(request())).status, 429);
    globalThis.fetch = async () =>
      Response.json({ private: "DB error" }, { status: 500 });
    const failed = await POST(request());
    assert.equal(failed.status, 503);
    assert(!(await failed.text()).includes("DB error"));
    process.env.LMS_REGISTRATION_INTENT_URL =
      "https://lms.example/api/registration/intent";
    process.env.LMS_REGISTRATION_INTENT_SECRET = "intent-secret";
    globalThis.fetch = async (url, options) => {
      if (String(url).includes("/api/registration/intent")) {
        const headers = new Headers(options?.headers);
        assert.equal(headers.get("x-registration-secret"), "intent-secret");
        const sent = JSON.parse(String(options?.body));
        assert.equal(sent.selectedBatch, "B");
        assert.equal("cohortId" in sent, false);
        return Response.json({
          ok: true,
          enrollment: "pending_account",
          cohortName: "Miss Jay May/June 2027 Online Batch — O Level 1123",
        });
      }
      const stored = JSON.parse(String(options?.body));
      assert.equal(stored.batch_letter, "B");
      assert.equal(stored.routing_status, "pending_account");
      return Response.json("saved");
    };
    const routed = await POST(request({ ...input, batch: "B" }));
    assert.equal(routed.status, 200);
    assert.deepEqual(await routed.json(), {
      saved: true,
      enrollment: "pending_account",
    });

    globalThis.fetch = async (url, options) => {
      if (String(url).includes("/api/registration/intent")) {
        return Response.json({ ok: true, enrollment: "needs_review" });
      }
      const stored = JSON.parse(String(options?.body));
      assert.equal(stored.routing_status, "needs_review");
      assert.equal(stored.destination_name, null);
      return Response.json("saved");
    };
    const review = await POST(request());
    assert.equal(review.status, 200);
    assert.deepEqual(await review.json(), {
      saved: true,
      enrollment: "needs_review",
    });

    globalThis.fetch = async (url, options) => {
      if (String(url).includes("/api/registration/intent")) {
        return new Response("<html>lms down</html>", {
          status: 502,
          headers: { "content-type": "text/html" },
        });
      }
      const stored = JSON.parse(String(options?.body));
      assert.equal(stored.routing_status, "pending_resolution");
      return Response.json("saved");
    };
    const lmsDown = await POST(request());
    assert.equal(lmsDown.status, 200);
    assert.deepEqual(await lmsDown.json(), {
      saved: true,
      enrollment: "received",
    });

    registrationBudget.forwardMs = 80;
    registrationBudget.deadlineMs = 3000;
    registrationBudget.saveMs = 1000;
    const slowStarted = Date.now();
    globalThis.fetch = async (url, options) => {
      if (String(url).includes("/api/registration/intent")) {
        return hangUntilAbort(url, options);
      }
      const stored = JSON.parse(String(options?.body));
      assert.equal(stored.routing_status, "pending_resolution");
      return Response.json("saved");
    };
    const slowForward = await POST(request());
    assert.equal(slowForward.status, 200);
    assert.deepEqual(await slowForward.json(), {
      saved: true,
      enrollment: "received",
    });
    assert.ok(Date.now() - slowStarted < 1000);
    restoreBudget();

    delete process.env.LMS_REGISTRATION_INTENT_URL;
    delete process.env.LMS_REGISTRATION_INTENT_SECRET;
    registrationBudget.saveMs = 80;
    registrationBudget.deadlineMs = 3000;
    registrationBudget.forwardMs = 50;
    const saveStarted = Date.now();
    globalThis.fetch = (url, options) => hangUntilAbort(url, options);
    const unconfirmed = await POST(request());
    assert.equal(unconfirmed.status, 504);
    const unconfirmedBody = await unconfirmed.json();
    assert.equal(unconfirmedBody.saved, false);
    assert.equal(unconfirmedBody.outcome, "unconfirmed");
    assert.equal(unconfirmedBody.error, registrationCopy.unconfirmed);
    assert.ok(Date.now() - saveStarted < 1000);
    restoreBudget();

    process.env.LMS_REGISTRATION_INTENT_URL =
      "https://lms.example/api/registration/intent";
    process.env.LMS_REGISTRATION_INTENT_SECRET = "intent-secret";
    registrationBudget.forwardMs = 400;
    registrationBudget.deadlineMs = 90;
    registrationBudget.saveMs = 5000;
    let savedDuringDeadline = 0;
    globalThis.fetch = (url, options) => {
      if (String(url).includes("supabase")) savedDuringDeadline += 1;
      return hangUntilAbort(url, options);
    };
    const deadline = await POST(request());
    assert.equal(deadline.status, 504);
    assert.deepEqual(await deadline.json(), {
      saved: false,
      outcome: "timeout",
      error: registrationCopy.timeout,
    });
    assert.equal(savedDuringDeadline, 0);
    restoreBudget();

    delete process.env.LMS_REGISTRATION_INTENT_URL;
    delete process.env.LMS_REGISTRATION_INTENT_SECRET;
    const requestIds: string[] = [];
    globalThis.fetch = async (_url, options) => {
      const stored = JSON.parse(String(options?.body));
      requestIds.push(stored.request_id);
      return Response.json("saved");
    };
    const first = await POST(request());
    const second = await POST(request());
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(requestIds.length, 2);
    assert.equal(requestIds[0], requestIds[1]);
    assert.equal((await first.json()).saved, true);

    globalThis.fetch = async () =>
      new Response("<html>private table</html>", { status: 200 });
    const messy = await POST(request());
    assert.equal(messy.status, 504);
    const messyText = await messy.text();
    assert.equal(JSON.parse(messyText).saved, false);
    assert.equal(messyText.includes("private table"), false);

    const lock = createSubmissionLock();
    assert.equal(lock.claim(), true);
    assert.equal(lock.claim(), false);
    lock.release();
    assert.equal(lock.claim(), true);

    const hung = Date.now();
    await assert.rejects(
      () => withTimeout(40, () => new Promise(() => undefined)),
      (error: unknown) => error instanceof Error && error.name === "TimeoutError",
    );
    assert.ok(Date.now() - hung < 500);

    const savedReview = interpretRegistrationHttp(
      200,
      JSON.stringify({ saved: true, enrollment: "needs_review" }),
    );
    assert.deepEqual(savedReview, { ok: true, enrollment: "needs_review" });
    const notSaved = interpretRegistrationHttp(
      200,
      JSON.stringify({ saved: false }),
    );
    assert.equal(notSaved.ok, false);
    const htmlOk = interpretRegistrationHttp(200, "<html>");
    assert.equal(htmlOk.ok, false);
    if (!htmlOk.ok) assert.equal(htmlOk.tone, "unconfirmed");
    const limited = interpretRegistrationHttp(429, JSON.stringify({ error: "nope" }));
    assert.equal(limited.ok, false);
    if (!limited.ok) {
      assert.equal(limited.tone, "rate");
      assert.equal(limited.message, registrationCopy.rateLimit);
    }
    const timedOut = interpretRegistrationHttp(
      504,
      JSON.stringify({ saved: false, outcome: "timeout" }),
    );
    assert.equal(timedOut.ok, false);
    if (!timedOut.ok) assert.equal(timedOut.tone, "timeout");
    const gateway = interpretRegistrationHttp(502, "<html>");
    assert.equal(gateway.ok, false);
    if (!gateway.ok) assert.equal(gateway.tone, "unconfirmed");
    const leaked = interpretRegistrationFailure(
      new Error("supabase service role secret"),
    );
    assert.equal(leaked.ok, false);
    if (!leaked.ok) {
      assert.equal(leaked.message, registrationCopy.failed);
      assert.equal(leaked.message.includes("secret"), false);
    }
    const offline = interpretRegistrationFailure(new TypeError("Failed to fetch"));
    assert.equal(offline.ok, false);
    if (!offline.ok) assert.equal(offline.tone, "offline");
    const browserTimeout = interpretRegistrationFailure(
      Object.assign(new Error("The operation was aborted."), { name: "AbortError" }),
    );
    assert.equal(browserTimeout.ok, false);
    if (!browserTimeout.ok) assert.equal(browserTimeout.tone, "timeout");

    for (const viewportWidth of [320, 375, 390, 430, 768]) {
      assert.equal(
        floatingControlsClearRegistration({
          pathname: REGISTRATION_PATH,
          viewportWidth,
        }),
        false,
      );
    }
    for (const viewportWidth of [1024, 1280, 1440]) {
      assert.equal(
        floatingControlsClearRegistration({
          pathname: REGISTRATION_PATH,
          viewportWidth,
        }),
        true,
      );
    }
    assert.equal(
      floatingControlsClearRegistration({ pathname: "/", viewportWidth: 390 }),
      true,
    );
    assert.equal(FLOATING_CLEAR_MIN_WIDTH, 1024);

    console.log(
      "Registration contracts passed: signed expiring ticket, consent, honeypot, bounded body, CSRF, private persistence, rate limits, safe failures, capped forwarding, unconfirmed saves, duplicate retries, and mobile clearance.",
    );
  } finally {
    restoreBudget();
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    internals._resolveFilename = originalResolve;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
