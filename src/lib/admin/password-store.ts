import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const PASSWORD_FILE = "admin-password.json";

interface StoredPassword {
  salt: string;
  hash: string;
  updatedAt: string;
}

async function ensureDataDir() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readStored(): Promise<StoredPassword | null> {
  await ensureDataDir();
  try {
    const raw = await readFile(join(DATA_DIR, PASSWORD_FILE), "utf-8");
    const parsed = JSON.parse(raw) as StoredPassword;
    if (parsed?.salt && parsed?.hash) return parsed;
    return null;
  } catch {
    return null;
  }
}

async function writeStored(data: StoredPassword): Promise<void> {
  await ensureDataDir();
  await writeFile(join(DATA_DIR, PASSWORD_FILE), JSON.stringify(data, null, 2));
}

function hashWithScrypt(plain: string, salt: Buffer): Buffer {
  return scryptSync(plain, salt, 64, { N: 16384, r: 8, p: 1 });
}

/** True if plain matches stored scrypt hash or env ADMIN_PASSWORD when no file yet. */
export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const stored = await readStored();
  if (stored) {
    const salt = Buffer.from(stored.salt, "base64");
    const expected = Buffer.from(stored.hash, "base64");
    const actual = hashWithScrypt(plain, salt);
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }

  const envPass = process.env.ADMIN_PASSWORD;
  if (!envPass) return false;
  const a = createHash("sha256").update(plain, "utf8").digest();
  const b = createHash("sha256").update(envPass, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Persist new password (scrypt). After this, env ADMIN_PASSWORD is ignored until file is removed. */
export async function setAdminPassword(plain: string): Promise<void> {
  const salt = randomBytes(16);
  const hash = hashWithScrypt(plain, salt);
  await writeStored({
    salt: salt.toString("base64"),
    hash: hash.toString("base64"),
    updatedAt: new Date().toISOString(),
  });
}
