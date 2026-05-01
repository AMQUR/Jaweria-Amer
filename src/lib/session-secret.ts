/** Admin session cookie secret; set SESSION_SECRET in production. */
const FALLBACK_SECRET = "jaweria-amer-dev-session-secret";
const INSECURE_FALLBACK = "jaweria-amer-missing-env-session-secret-rotate";

export function getSessionSecret(): string {
  console.log("SESSION_SECRET ACTIVE:", !!process.env.SESSION_SECRET);
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    if (typeof console !== "undefined" && console.error) {
      console.error(
        "[admin] SESSION_SECRET is not set. Using an insecure in-process fallback — set SESSION_SECRET in production for secure sessions."
      );
    }
    return INSECURE_FALLBACK;
  }
  return FALLBACK_SECRET;
}
