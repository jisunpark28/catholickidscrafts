export function parseBulkWordLines(text: string): { word: string; hint: string }[] {
  const lines = text.split(/\r?\n/);
  const out: { word: string; hint: string }[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    let word = line;
    let hint = "";

    if (line.includes("|")) {
      const [w, ...rest] = line.split("|");
      word = w?.trim() ?? "";
      hint = rest.join("|").trim();
    } else if (line.includes("\t")) {
      const [w, h] = line.split("\t");
      word = w?.trim() ?? "";
      hint = h?.trim() ?? "";
    } else if (line.includes(",")) {
      const idx = line.indexOf(",");
      word = line.slice(0, idx).trim();
      hint = line.slice(idx + 1).trim();
    }

    if (word.length > 0) out.push({ word, hint });
  }

  return out;
}
