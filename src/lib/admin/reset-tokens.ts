import { createHash, createHmac, randomBytes } from "node:crypto";
import { getSessionSecret } from "@/lib/session-secret";

export const RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

/** 256 bits from the OS CSPRNG. Only its SHA-256 hash is ever stored. */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Keyed hash of the caller's network address, for rate limiting without storing IPs. */
export function hashNetwork(address: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(`admin-reset:ip:${address}`)
    .digest("hex");
}
