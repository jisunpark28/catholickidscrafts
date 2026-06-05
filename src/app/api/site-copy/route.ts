import { getSiteCopyByGroup, getSiteCopyByPrefix, getSiteCopyMap } from "@/lib/site-copy";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const prefix = searchParams.get("prefix");
  const keysParam = searchParams.get("keys");

  try {
    if (group) {
      const map = await getSiteCopyByGroup(group);
      return NextResponse.json(map, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    if (prefix) {
      const full = await getSiteCopyByPrefix(prefix.endsWith(".") ? prefix : `${prefix}.`);
      const short: Record<string, string> = {};
      const p = prefix.endsWith(".") ? prefix : `${prefix}.`;
      for (const [key, value] of Object.entries(full)) {
        short[key.startsWith(p) ? key.slice(p.length) : key] = value;
      }
      return NextResponse.json(short, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    if (keysParam) {
      const keys = keysParam.split(",").map((k) => k.trim()).filter(Boolean);
      const all = await getSiteCopyMap();
      const out: Record<string, string> = {};
      for (const key of keys) {
        if (all[key] !== undefined) out[key] = all[key]!;
      }
      return NextResponse.json(out, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const all = await getSiteCopyMap();
    return NextResponse.json(all, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("site-copy:", e);
    return NextResponse.json({}, { status: 200 });
  }
}
