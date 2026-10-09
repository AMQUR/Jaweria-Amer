import { NextRequest, NextResponse } from "next/server";
import { registrationInput } from "@/lib/registration/contracts";
import {
  forwardRegistration,
  saveRegistration,
  verifyRegistrationTicket,
} from "@/lib/registration/server";
export const runtime = "nodejs";
export const maxDuration = 15;
const MAX_BYTES = 4096;
function reply(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function POST(request: NextRequest) {
  if (
    request.headers.get("origin") !== request.nextUrl.origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return reply({ error: "Please use the form on this website." }, 403);
  if (
    !(request.headers.get("content-type") ?? "").startsWith("application/json")
  )
    return reply({ error: "Please use the registration form." }, 415);
  if (Number(request.headers.get("content-length")) > MAX_BYTES)
    return reply({ error: "The submission is too large." }, 413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Please complete the form." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return reply({ error: "The submission is too large." }, 413);
      }
      chunks.push(value);
    }
    const parsed = registrationInput.safeParse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (!parsed.success)
      return reply(
        { error: "Please check your name, email, course and consent." },
        400,
      );
    const requestId = verifyRegistrationTicket(parsed.data.ticket);
    if (!requestId)
      return reply(
        {
          error:
            "Please refresh this page and try again after completing the form.",
        },
        400,
      );
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      (process.env.NODE_ENV !== "production" ? "local" : "");
    if (!ip)
      return reply(
        {
          error:
            "Registration is temporarily unavailable. Please contact Miss Jay.",
        },
        503,
      );
    const routing = await forwardRegistration(parsed.data, requestId);
    const result = await saveRegistration(parsed.data, ip, requestId, routing);
    if (result === "limited")
      return reply(
        {
          error:
            "Please wait before sending another request. You can also contact Miss Jay directly.",
        },
        429,
      );
    return reply({ saved: true, enrollment: routing.enrollment });
  } catch (error) {
    return reply(
      {
        error:
          error instanceof SyntaxError
            ? "Please check your submission."
            : "We could not confirm your request. Please retry or contact Miss Jay directly.",
      },
      error instanceof SyntaxError ? 400 : 503,
    );
  }
}
