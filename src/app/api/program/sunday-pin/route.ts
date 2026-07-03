import {
  clearTeacherSundayPin,
  getTeacherSundayPin,
  setTeacherSundayPin,
} from "@/lib/lesson-kit/sunday-pin";
import { requireFamilySession } from "@/lib/family-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const pin = await getTeacherSundayPin(session.familyAccountId);
  return NextResponse.json(pin);
}

const putBodySchema = z.object({
  lessonKitId: z.string().min(1),
});

export async function PUT(req: Request) {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = putBodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "lessonKitId required" }, { status: 400 });
  }

  const pin = await setTeacherSundayPin(session.familyAccountId, parsed.data.lessonKitId);
  if (!pin) {
    return NextResponse.json({ error: "Lesson not found or not allowed" }, { status: 404 });
  }

  return NextResponse.json(pin);
}

export async function DELETE() {
  const session = await requireFamilySession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const pin = await clearTeacherSundayPin(session.familyAccountId);
  return NextResponse.json(pin);
}
