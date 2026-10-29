/** Shared helpers for the card scripts: find ID.png originals under a folder (recursive). */
import fs from "node:fs/promises";
import path from "node:path";

export const CARD_FILE_RE = /^([A-Z]{3}-\d{3})\.png$/;

export async function findCardPngs(root: string): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  const walk = async (dir: string, depth: number) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && depth < 3) await walk(full, depth + 1);
      const m = e.isFile() ? CARD_FILE_RE.exec(e.name) : null;
      if (m) {
        if (found.has(m[1]!)) throw new Error(`Duplicate card file ${m[1]}: ${found.get(m[1]!)} and ${full}`);
        found.set(m[1]!, full);
      }
    }
  };
  await walk(path.resolve(root), 0);
  return found;
}

export function argValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}
