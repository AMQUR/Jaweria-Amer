import assert from "node:assert/strict";
import { createRequire } from "node:module";
import Module from "node:module";
import {
  evaluationInput,
  evaluationFeedback,
  validateAssignmentFile,
  MAX_FILE_BYTES,
} from "../src/lib/evaluation/contracts";
import {
  isBatchAnnouncementActive,
  publicExperience,
} from "../src/lib/public-experience";

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

async function main() {
  const {
    assessAssignment,
    evaluationAvailable,
    getEvaluationSession,
    identityHash,
    reserveEvaluation,
  } = await import("../src/lib/evaluation/server");
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  process.env.EVALUATION_IDENTITY_SECRET =
    "test-only-secret-that-is-long-enough-for-hmac";
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_EVALUATION_MODEL = "test-model";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  process.env.FREE_EVALUATION_ENABLED = "true";
  process.env.FREE_EVALUATION_PRIVACY_APPROVED = "true";
  try {
    assert(isBatchAnnouncementActive(new Date("2026-10-08T12:00:00Z")));
    assert(!isBatchAnnouncementActive(new Date("2026-10-07T00:00:00Z")));
    assert(
      !isBatchAnnouncementActive(new Date(publicExperience.batch.expiresAt)),
    );
    assert(!isBatchAnnouncementActive(new Date("2027-01-01")));
    assert.equal(publicExperience.lessons.length, 2);
    assert(publicExperience.lessons.every((l) => !l.src));
    const pdf = Buffer.from("%PDF-1.7\nplain text");
    assert.equal(
      validateAssignmentFile("../../answer.pdf", "application/pdf", pdf),
      null,
    ); // name is never used for storage
    assert(
      validateAssignmentFile(
        "answer.svg",
        "image/svg+xml",
        Buffer.from("<svg/>"),
      ),
    );
    assert(
      validateAssignmentFile("answer.png", "image/png", Buffer.from([137])),
    );
    assert(
      validateAssignmentFile(
        "answer.pdf",
        "application/pdf",
        Buffer.from("fake"),
      ),
    );
    assert(validateAssignmentFile("answer.pdf", "image/png", pdf));
    assert(
      validateAssignmentFile(
        "answer.pdf",
        "application/pdf",
        Buffer.from("%PDF-1.7 /JavaScript"),
      ),
    );
    assert(
      validateAssignmentFile(
        "answer.pdf",
        "application/pdf",
        Buffer.alloc(MAX_FILE_BYTES + 1),
      ),
    );
    const data = {
      firstName: " Sam ",
      email: " SAM@EXAMPLE.COM ",
      course: "O Level English Language 1123",
      assignmentType: "Narrative writing",
      task: "Write about an unexpected event.",
      answer:
        "This answer is long enough for a thoughtful assessment of its structure, pacing and language.",
      consent: "yes",
    };
    assert.equal(evaluationInput.parse(data).email, "sam@example.com");
    for (const course of [
      "IGCSE English as a First Language 0500",
      "IGCSE English as a Second Language 0510/0511",
      "AS Level English Language 9093",
    ])
      assert(evaluationInput.safeParse({ ...data, course }).success);
    assert(
      !evaluationInput.safeParse({
        ...data,
        assignmentType: "Directed writing",
      }).success,
    );
    assert(!evaluationInput.safeParse({ ...data, course: "invented" }).success);
    assert(!evaluationInput.safeParse({ ...data, consent: "no" }).success);
    assert(evaluationAvailable());
    delete process.env.OPENAI_API_KEY;
    assert(!evaluationAvailable());
    process.env.OPENAI_API_KEY = "test-key";
    process.env.FREE_EVALUATION_PRIVACY_APPROVED = "false";
    assert(!evaluationAvailable());
    process.env.FREE_EVALUATION_PRIVACY_APPROVED = "true";
    const session = getEvaluationSession();
    assert.equal(getEvaluationSession(session.token).id, session.id);
    assert.notEqual(
      getEvaluationSession(
        session.token.replace(/.$/, session.token.endsWith("a") ? "b" : "a"),
      ).id,
      session.id,
    );
    assert.equal(identityHash("email:sam@example.com").length, 64);
    for (const quota of ["allowed", "limit", "cooldown", "busy"]) {
      globalThis.fetch = async (_url, options) => {
        const body = JSON.parse(String(options?.body));
        assert(!String(options?.body).includes("sam@example.com"));
        assert.equal(body.lifetime_limit, 1);
        return Response.json(quota);
      };
      assert.equal(
        await reserveEvaluation("sam@example.com", session.id, "local"),
        quota,
      );
    }
    globalThis.fetch = async () =>
      Response.json({ error: "private DB error" }, { status: 500 });
    await assert.rejects(
      reserveEvaluation("sam@example.com", session.id, "local"),
      /quota_unavailable/,
    );
    const feedback = {
      readable: true,
      strengths: [
        { observation: "You establish a setting.", evidence: "long enough" },
        {
          observation: "Your sentence has a clear direction.",
          evidence: "thoughtful assessment",
        },
      ],
      biggestOpportunity: "Make the action more concrete.",
      improvements: ["Add one action.", "Vary the sentence lengths."],
      originalExample: "",
      improvedExample: "",
      nextFocus: "Rewrite the opening.",
    };
    const work = {
      course: data.course,
      assignmentType: data.assignmentType,
      task: data.task,
      answer: data.answer,
    };
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      const body = JSON.parse(String(options?.body));
      assert.equal(body.store, false);
      assert.equal(body.text.format.strict, true);
      assert(!String(options?.body).includes(data.email));
      assert(body.input[0].content.includes("untrusted STUDENT CONTENT"));
      assert(!("tools" in body));
      return Response.json({
        output: [
          {
            content: [{ type: "output_text", text: JSON.stringify(feedback) }],
          },
        ],
      });
    };
    assert.deepEqual(await assessAssignment(work), feedback);
    globalThis.fetch = async () =>
      Response.json({
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  ...feedback,
                  strengths: [
                    {
                      observation: "Invented strength",
                      evidence: "not actually in the answer",
                    },
                    feedback.strengths[1],
                  ],
                }),
              },
            ],
          },
        ],
      });
    await assert.rejects(assessAssignment(work), /ungrounded_feedback/);

    assert(
      !evaluationFeedback.safeParse({ ...feedback, officialMark: 100 }).success,
    );
    globalThis.fetch = async () =>
      Response.json({
        output: [{ content: [{ type: "output_text", text: "not JSON" }] }],
      });
    await assert.rejects(assessAssignment(work));
    globalThis.fetch = async () => {
      throw new DOMException("Timeout", "TimeoutError");
    };
    await assert.rejects(assessAssignment(work));
    const { POST } = await import("../src/app/api/free-evaluation/route");
    const { NextRequest } = await import("next/server");
    const submitRequest = (
      overrides: Record<string, string> = {},
      file?: File,
      origin = "https://jaweriaamer.com",
    ) => {
      const form = new FormData();
      for (const [key, value] of Object.entries({ ...data, ...overrides }))
        form.set(key, value);
      if (file) form.set("file", file);
      return new NextRequest("https://jaweriaamer.com/api/free-evaluation", {
        method: "POST",
        headers: { origin },
        body: form,
      });
    };
    assert.equal(
      (await POST(submitRequest({}, undefined, "https://evil.example"))).status,
      403,
    );
    process.env.FREE_EVALUATION_ENABLED = "false";
    assert.equal((await POST(submitRequest())).status, 503);
    process.env.FREE_EVALUATION_ENABLED = "true";
    assert.equal((await POST(submitRequest({ consent: "no" }))).status, 400);
    assert.equal((await POST(submitRequest({ answer: "tiny" }))).status, 400);
    assert.equal(
      (
        await POST(
          submitRequest(
            { answer: "" },
            new File(["evil"], "bad.svg", { type: "image/svg+xml" }),
          ),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await POST(
          submitRequest(
            { answer: "" },
            new File([Buffer.alloc(MAX_FILE_BYTES + 1)], "big.pdf", {
              type: "application/pdf",
            }),
          ),
        )
      ).status,
      413,
    );
    globalThis.fetch = async (url) =>
      String(url).includes("supabase")
        ? Response.json("limit")
        : Response.json({});
    assert.equal((await POST(submitRequest())).status, 429);
    globalThis.fetch = async (url) =>
      String(url).includes("supabase")
        ? Response.json("allowed")
        : Response.json({
            output: [
              {
                content: [
                  { type: "output_text", text: JSON.stringify(feedback) },
                ],
              },
            ],
          });
    const success = await POST(submitRequest());
    assert.equal(success.status, 200);
    assert(success.headers.get("set-cookie")?.includes("HttpOnly"));
    assert.equal(success.headers.get("cache-control"), "no-store");
    assert.deepEqual((await success.json()).feedback, feedback);
    const uploaded = await POST(
      submitRequest(
        { answer: "" },
        new File([pdf], "../../private.pdf", { type: "application/pdf" }),
      ),
    );
    assert.equal(uploaded.status, 200);
    globalThis.fetch = async (url) =>
      String(url).includes("supabase")
        ? Response.json("allowed")
        : Response.json({ output: [] });
    const failed = await POST(submitRequest());
    assert.equal(failed.status, 503);
    assert(!(await failed.text()).includes("SyntaxError"));
    console.log(
      "Public experience contracts passed: dates, placeholders, MIME/size, consent, topics, fail-closed settings, signed session, hashed quota, structured output, provider failure/timeout.",
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
    internals._resolveFilename = originalResolve;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
