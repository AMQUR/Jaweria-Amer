import { NextRequest, NextResponse } from "next/server";
import {
  evaluationInput,
  MAX_BODY_BYTES,
  MAX_FILE_BYTES,
  validateAssignmentFile,
} from "@/lib/evaluation/contracts";
import {
  assessAssignment,
  evaluationAvailable,
  getEvaluationSession,
  reserveEvaluation,
} from "@/lib/evaluation/server";
export const runtime = "nodejs";
export const maxDuration = 60;

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
async function readBoundedBody(request: Request): Promise<Uint8Array> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error("oversize");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
export async function POST(request: NextRequest) {
  if (
    request.headers.get("origin") !== request.nextUrl.origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return reply({ error: "Please submit from this website." }, 403);
  if (!evaluationAvailable())
    return reply(
      {
        error:
          "Free evaluations are not available yet. Your work has not been submitted.",
      },
      503,
    );
  if (
    !(request.headers.get("content-type") ?? "").startsWith(
      "multipart/form-data",
    )
  )
    return reply({ error: "Please use the submission form." }, 415);
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    return reply({ error: "Choose a file under 2 MB." }, 413);
  let form: FormData;
  try {
    const bytes = await readBoundedBody(request);
    form = await new Response(bytes as BodyInit, {
      headers: { "Content-Type": request.headers.get("content-type")! },
    }).formData();
  } catch {
    return reply(
      {
        error:
          "We could not read that submission. Use a PDF, JPG or PNG under 2 MB, or paste your answer.",
      },
      400,
    );
  }
  const parsed = evaluationInput.safeParse(
    Object.fromEntries(
      [
        "firstName",
        "email",
        "course",
        "assignmentType",
        "answer",
        "task",
        "consent",
      ].map((key) => [key, form.get(key)]),
    ),
  );
  if (!parsed.success)
    return reply(
      {
        error:
          "Check your details, include the question, and confirm consent before submitting.",
      },
      400,
    );
  const upload = form.get("file");
  let file: { mime: string; bytes: Uint8Array } | undefined;
  if (upload instanceof File && upload.size) {
    if (upload.size > MAX_FILE_BYTES)
      return reply({ error: "Choose a file under 2 MB." }, 413);
    const bytes = new Uint8Array(await upload.arrayBuffer());
    const error = validateAssignmentFile(upload.name, upload.type, bytes);
    if (error) return reply({ error }, 400);
    file = { mime: upload.type, bytes };
  }
  if (file && parsed.data.answer)
    return reply(
      { error: "Choose one answer: upload a file or paste text." },
      400,
    );
  if (!file && parsed.data.answer.length < 80)
    return reply(
      {
        error: "Paste at least 80 characters so we have enough work to assess.",
      },
      400,
    );
  const session = getEvaluationSession(
    request.cookies.get("ja-evaluation")?.value,
  );
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    : "local";
  if (!ip)
    return reply(
      { error: "We cannot start the evaluation right now. Please try later." },
      503,
    );
  const attachSession = (response: NextResponse) => {
    response.cookies.set("ja-evaluation", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
    return response;
  };
  try {
    const quota = await reserveEvaluation(parsed.data.email, session.id, ip);
    if (quota !== "allowed") {
      return attachSession(
        reply(
          {
            error:
              quota === "limit"
                ? "You have used your free evaluation allowance. Explore the programme for ongoing feedback."
                : quota === "cooldown"
                  ? "Please wait a few minutes before another evaluation."
                  : "Free evaluations are busy right now. Please try again later.",
          },
          429,
        ),
      );
    }
    // Contact details never reach the analysis provider, logs or analytics.
    const { course, assignmentType, task, answer } = parsed.data;
    const feedback = await assessAssignment(
      { course, assignmentType, task, answer },
      file,
    );
    return attachSession(reply({ feedback }));
  } catch {
    // No raw provider response, document, personal details or stack traces are exposed.
    return attachSession(
      reply(
        {
          error:
            "We could not prepare your feedback. Your answer is still in the form. An analysis attempt may have used your free allowance; contact us if you need help.",
        },
        503,
      ),
    );
  }
}
