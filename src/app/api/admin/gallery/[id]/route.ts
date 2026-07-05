import { requireAdminSession } from "@/lib/admin-auth";
import { moderateGallerySubmission } from "@/lib/craft-gallery";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { session, error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: session!.user!.email! },
    select: { id: true },
  });
  if (!admin) {
    return NextResponse.json({ error: "Admin user not found" }, { status: 403 });
  }

  const existing = await prisma.craftGallerySubmission.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await moderateGallerySubmission({
    id,
    action: parsed.data.action,
    moderatorAdminUserId: admin.id,
  });

  return NextResponse.json({
    id: updated.id,
    isApproved: updated.isApproved,
    rejectedAt: updated.rejectedAt?.toISOString() ?? null,
  });
}
