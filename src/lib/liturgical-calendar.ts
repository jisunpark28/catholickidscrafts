function normalizeLiturgicalName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bst\./g, "saint")
    .replace(/\s+/g, " ")
    .trim();
}

/** Format Evangelizo saint/feast lines for the General Roman Calendar (when not already in the weekday title). */
export function formatRomanCalendarCelebration(
  liturgicalTitle: string,
  saint?: string,
  feast?: string,
): string | undefined {
  const normalizedTitle = normalizeLiturgicalName(liturgicalTitle);
  const entries: string[] = [];

  const saintLines = (saint ?? "")
    .split(/\n+/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  for (const line of saintLines) {
    const coreName = normalizeLiturgicalName(
      line.replace(/\s*-\s*(Feast|Memorial|Optional Memorial).*$/i, ""),
    );
    if (coreName.length > 4 && normalizedTitle.includes(coreName)) {
      continue;
    }
    entries.push(line);
  }

  const feastText = feast?.trim();
  if (feastText) {
    const feastCore = normalizeLiturgicalName(
      feastText.replace(/\s*-\s*(Feast|Memorial|Optional Memorial).*$/i, ""),
    );
    if (
      feastCore.length > 4 &&
      !normalizedTitle.includes(feastCore) &&
      !entries.includes(feastText)
    ) {
      entries.push(feastText);
    }
  }

  if (entries.length === 0) return undefined;
  return entries.join(" · ");
}
