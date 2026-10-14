// Only allow same-site relative paths, so /auth?next=https://evil.com can't bounce users off-site.
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/auth-dashboard"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback; // must be a relative path
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback; // protocol-relative URLs
  return next;
}