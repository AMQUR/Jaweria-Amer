import { createHash, randomBytes } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const TOKENS_FILE = "password-reset-tokens.json";

const RESET_TTL_MS = 20 * 60 * 1000; // 20 minutes

interface ResetTokenRecord {
  tokenHash: string;
  expiresAt: string;
  used: boolean;
}

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

async function readRecords(): Promise<ResetTokenRecord[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(join(DATA_DIR, TOKENS_FILE), "utf-8");
    const parsed = JSON.parse(raw) as ResetTokenRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRecords(records: ResetTokenRecord[]): Promise<void> {
  await ensureDataDir();
  await writeFile(join(DATA_DIR, TOKENS_FILE), JSON.stringify(records, null, 2));
}

function prune(records: ResetTokenRecord[]): ResetTokenRecord[] {
  const now = Date.now();
  return records.filter((r) => {
    const exp = new Date(r.expiresAt).getTime();
    if (Number.isNaN(exp)) return false;
    // keep records briefly after expiry so "used" / "expired" still resolve correctly
    return now <= exp + 24 * 60 * 60 * 1000;
  });
}

/** Returns plaintext token to embed in URL (store only hash). */
export async function createPasswordResetToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
  const records = prune(await readRecords());
  records.push({ tokenHash, expiresAt, used: false });
  await writeRecords(records);
  return token;
}

export type ValidateTokenResult = "ok" | "expired" | "invalid" | "used";

export async function validatePasswordResetToken(token: string): Promise<ValidateTokenResult> {
  if (!token || token.length < 32) return "invalid";
  const tokenHash = hashToken(token);
  const records = await readRecords();
  const now = Date.now();
  const match = records.find((r) => r.tokenHash === tokenHash);
  if (!match) return "invalid";
  if (match.used) return "used";
  if (now > new Date(match.expiresAt).getTime()) return "expired";
  return "ok";
}

export async function consumePasswordResetToken(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const records = await readRecords();
  const idx = records.findIndex((r) => r.tokenHash === tokenHash && !r.used);
  if (idx < 0) return false;
  const now = Date.now();
  if (now > new Date(records[idx].expiresAt).getTime()) return false;
  records[idx] = { ...records[idx], used: true };
  await writeRecords(prune(records));
  return true;
}
