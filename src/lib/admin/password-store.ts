import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { getStoredCredential, PASSWORD_KDF } from "./credential-store";

const SCRYPT = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;

function scryptAsync(plain: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, KEY_LENGTH, SCRYPT, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Salted scrypt hash for storage. The plaintext never leaves this process. */
export async function hashAdminPassword(plain: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(plain, salt);
  return { hash: hash.toString("base64"), salt: salt.toString("base64") };
}

export interface PasswordCheck {
  ok: boolean;
  /** Credential version the password belongs to; sessions are bound to it. */
  version: number;
}

/**
 * Checks a sign-in password.
 *
 * Once a reset has completed, the stored hash is the only accepted password:
 * ADMIN_PASSWORD is ignored from then on, so an old environment password can
 * never work again. Before any reset (no stored row, or the store not yet
 * migrated) ADMIN_PASSWORD is used, exactly as before.
 *
 * Throws CredentialStoreError when the store cannot be read. Callers must
 * treat that as a refused sign-in, not as "fall back to ADMIN_PASSWORD".
 */
export async function verifyAdminPassword(plain: string): Promise<PasswordCheck> {
  const stored = await getStoredCredential();
  if (stored) {
    if (stored.kdf !== PASSWORD_KDF) return { ok: false, version: stored.version };
    const expected = Buffer.from(stored.hash, "base64");
    const actual = await scryptAsync(plain, Buffer.from(stored.salt, "base64"));
    return {
      ok: actual.length === expected.length && timingSafeEqual(actual, expected),
      version: stored.version,
    };
  }
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envPass) return { ok: false, version: 0 };
  const a = createHash("sha256").update(plain, "utf8").digest();
  const b = createHash("sha256").update(envPass, "utf8").digest();
  return { ok: timingSafeEqual(a, b), version: 0 };
}
