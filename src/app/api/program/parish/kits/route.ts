import {
  createParishKitFromSource,
  duplicateGlobalToParish,
  publishPersonalKitToParish,
} from "@/lib/lesson-kit/parish-admin";
import { requireDre } from "@/lib/lesson-kit/parish-permissions";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const dre = await requireDre(session.familyAccountId);
  if (!dre) {
    return NextResponse.json({ error: "DRE role required" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    sourceId?: string;
    personalKitId?: string;
    title?: string;
  };

  let kit = null;
  if (body.personalKitId) {
    kit = await publishPersonalKitToParish({
      personalKitId: body.personalKitId,
      parishId: dre.parishId,
      familyAccountId: session.familyAccountId,
    });
  } else if (body.sourceId) {
    const source = await duplicateGlobalToParish(dre.parishId, body.sourceId);
    kit = source;
    if (!kit) {
      kit = await createParishKitFromSource({
        parishId: dre.parishId,
        sourceId: body.sourceId,
        title: body.title,
      });
    }
  }

  if (!kit) {
    return NextResponse.json({ error: "Could not create parish kit" }, { status: 400 });
  }

  return NextResponse.json({ kit });
}
