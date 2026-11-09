import { getSituation } from "@/data/moms-bible/situations";
import { resolveSituationVerse } from "@/lib/moms-bible/resolve-situation-verse";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public scripture text for one Mom's Bible moment. No account, note, or database write.
 * The situations board asks for the selected moment only, so hundreds of chips do not
 * each fetch a chapter on first paint.
 */
export async function GET(request: Request) {
  const blocked = crossOriginError(request);
  if (blocked) return blocked;
  const key = new URL(request.url).searchParams.get("key");
  const situation = getSituation(key);
  if (!situation) return NextResponse.json({ error: "Unknown moment" }, { status: 404 });
  const verses = (
    await Promise.all(situation.refs.map((ref) => resolveSituationVerse(ref, situation.key)))
  ).filter((verse): verse is NonNullable<typeof verse> => Boolean(verse));
  return NextResponse.json(
    {
      key: situation.key,
      verses: verses.map((verse) => ({ label: verse.ref.label, href: verse.href, text: verse.text })),
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
