import { requireAdminSession } from "@/lib/admin-auth";
import {
  listAdminResourcesForTrack,
  saveTrackResourceOrder,
} from "@/lib/curriculum-resources";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const track = await prisma.curriculumTrack.findUnique({ where: { id } });
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const resources = await listAdminResourcesForTrack(track.id, track.title);
  return NextResponse.json({ trackTitle: track.title, resources });
}

const putSchema = z.object({
  resourceIds: z.array(z.string().min(1)),
});

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const track = await prisma.curriculumTrack.findUnique({ where: { id } });
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allowed = await prisma.resource.findMany({
    where: { grade: track.title, id: { in: parsed.data.resourceIds } },
    select: { id: true },
  });
  const allowedIds = new Set(allowed.map((r) => r.id));
  const resourceIds = parsed.data.resourceIds.filter((rid) => allowedIds.has(rid));

  await saveTrackResourceOrder(track.id, resourceIds);
  const resources = await listAdminResourcesForTrack(track.id, track.title);
  return NextResponse.json({ ok: true, resources });
}
