/** Escape RFC 4180 para células CSV. */
export function escapeCSV(raw: unknown): string {
  const v = raw == null ? "" : String(raw);
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}
