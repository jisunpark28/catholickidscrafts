/** Prefer DIRECT_URL; derive Neon direct host from pooled DATABASE_URL when missing. */
export function getDirectDatabaseUrl(): string {
  const fromEnv = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  const candidate = fromEnv || pooled;
  if (!candidate) {
    throw new Error("Missing DATABASE_URL");
  }
  return deriveNeonDirectUrl(candidate);
}

/** Neon pooled hosts use `-pooler`; DDL needs the direct host. */
export function deriveNeonDirectUrl(url: string): string {
  if (!url.includes("-pooler")) return url;
  return url.replace("-pooler", "");
}
