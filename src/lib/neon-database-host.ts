/** Safe host label for logs/diagnostics (no credentials). */
export function neonDatabaseHostLabel(url?: string | null): string | null {
  const candidate = url?.trim();
  if (!candidate) return null;
  try {
    return new URL(candidate.replace(/^postgres(ql)?:\/\//, "https://")).hostname;
  } catch {
    return null;
  }
}
