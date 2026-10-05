// Backups can contain untrusted links. Never render executable URLs.
export function safeWebUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) return url.href;
  } catch { /* Invalid or relative URL. */ }
  return undefined;
}
