import { requireAdminSession } from "@/lib/admin-auth";
import { isValidMassGesture } from "@/lib/mass-order-steps";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const stepSchema = z.object({
  id: z.string().optional(),
  stepIndex: z.number().int().min(0).max(99),
  part: z.string().min(1).max(120),
  partEn: z.string().min(1).max(120),
  title: z.string().min(1).max(120),
  text: z.string().min(1).max(2000),
  gesture: z.string().min(1).max(32),
  published: z.boolean().optional(),
});

const bulkSchema = z.object({
  steps: z.array(stepSchema).min(1).max(50),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await prisma.massOrderStep.findMany({
    orderBy: { stepIndex: "asc" },
  });
  return NextResponse.json(items);
}

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  for (const step of parsed.data.steps) {
    if (!isValidMassGesture(step.gesture)) {
      return NextResponse.json(
        { error: `Invalid gesture “${step.gesture}” on step ${step.stepIndex + 1}.` },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const step of parsed.data.steps) {
      const data = {
        part: step.part.trim(),
        partEn: step.partEn.trim(),
        title: step.title.trim(),
        text: step.text.trim(),
        gesture: step.gesture.trim(),
        published: step.published ?? true,
      };

      await tx.massOrderStep.upsert({
        where: { stepIndex: step.stepIndex },
        update: data,
        create: { stepIndex: step.stepIndex, ...data },
      });
    }
  });

  return NextResponse.json({ saved: parsed.data.steps.length });
}
