import assert from "node:assert/strict";
import {
  generateAdminSessionToken,
  verifyAdminSessionToken,
  ADMIN_SESSION_MAX_AGE,
} from "../src/lib/admin/session";
const env = { ...process.env };
try {
  process.env.SESSION_SECRET = "test-only-admin-secret-at-least-32-characters";
  process.env.ADMIN_EMAIL = "admin@example.invalid";
  const now = Date.now(),
    token = generateAdminSessionToken(" ADMIN@example.invalid ", now);
  assert(verifyAdminSessionToken(token, now));
  assert(
    !Buffer.from(token.split(".")[0], "base64url")
      .toString()
      .includes(process.env.SESSION_SECRET),
  );
  assert(!verifyAdminSessionToken(token.replace(/.$/, "z"), now));
  assert(!verifyAdminSessionToken(token, now + ADMIN_SESSION_MAX_AGE * 1000));
  assert(!verifyAdminSessionToken(token, now - 1));
  assert(
    !verifyAdminSessionToken(
      generateAdminSessionToken("other@example.invalid", now),
      now,
    ),
  );
  assert(
    !verifyAdminSessionToken(
      Buffer.from(
        `admin@example.invalid:${now}:${process.env.SESSION_SECRET}`,
      ).toString("base64"),
      now,
    ),
  );
  process.env.SESSION_SECRET =
    "rotated-test-only-secret-at-least-32-characters";
  assert(!verifyAdminSessionToken(token, now));
  delete process.env.SESSION_SECRET;
  assert(!verifyAdminSessionToken(token, now));
  assert.throws(() => generateAdminSessionToken("admin@example.invalid"));
  console.log(
    "Admin session checks passed: HMAC, identity, expiry, tamper, legacy rejection, rotation and missing-secret failure.",
  );
} finally {
  process.env = env;
}
