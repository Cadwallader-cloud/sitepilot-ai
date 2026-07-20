/** Comma-separated admin emails in ADMIN_EMAILS env. */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}

/** Returns admin email or null (caller redirects / 404). */
export async function requireAdmin(): Promise<string | null> {
  const { auth } = await import("@/auth");
  const session = await auth();
  const email = session?.user?.email?.trim() ?? null;
  if (!email || !isAdminEmail(email)) return null;
  return email.toLowerCase();
}
