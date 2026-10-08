import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import { registrationInput } from "../src/lib/registration/contracts";
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
async function main() {
  const originalEnv = { ...process.env },
    originalFetch = globalThis.fetch;
  try {
    process.env.SESSION_SECRET =
      "test-registration-secret-at-least-32-characters";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-private-key";
    const { createRegistrationTicket, verifyRegistrationTicket } = await import(
      "../src/lib/registration/server"
    );
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
      assert.equal(body.network_hash.length, 64);
      assert(!String(options?.body).includes("192.0.2.1"));
      return Response.json("saved");
    };
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), { saved: true });
    assert.equal(writes, 1);
    globalThis.fetch = async () => Response.json("limited");
    assert.equal((await POST(request())).status, 429);
    globalThis.fetch = async () =>
      Response.json({ private: "DB error" }, { status: 500 });
    const failed = await POST(request());
    assert.equal(failed.status, 503);
    assert(!(await failed.text()).includes("DB error"));
    console.log(
      "Registration contracts passed: signed expiring ticket, consent, honeypot, bounded body, CSRF, private persistence, rate limits, safe failures.",
    );
  } finally {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    internals._resolveFilename = originalResolve;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
