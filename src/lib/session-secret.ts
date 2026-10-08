/** Admin credentials fail closed when the server secret is missing. */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 32)
    throw new Error("admin_session_unavailable");
  return secret;
}
