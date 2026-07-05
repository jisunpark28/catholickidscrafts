import { prisma } from "@/lib/prisma";

export type GallerySubmissionRow = {
  id: string;
  imageUrl: string;
  authorName: string;
  caption: string | null;
  resourceTitle: string | null;
  resourceSlug: string | null;
  isApproved: boolean;
  rejectedAt: Date | null;
  createdAt: Date;
};

function mapRow(
  row: {
    id: string;
    imageUrl: string;
    authorName: string;
    caption: string | null;
    isApproved: boolean;
    rejectedAt: Date | null;
    createdAt: Date;
    resource: { title: string; slug: string } | null;
  },
): GallerySubmissionRow {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    authorName: row.authorName,
    caption: row.caption,
    resourceTitle: row.resource?.title ?? null,
    resourceSlug: row.resource?.slug ?? null,
    isApproved: row.isApproved,
    rejectedAt: row.rejectedAt,
    createdAt: row.createdAt,
  };
}

export async function listPendingGallerySubmissions(): Promise<GallerySubmissionRow[]> {
  const rows = await prisma.craftGallerySubmission.findMany({
    where: { isApproved: false, rejectedAt: null },
    orderBy: { createdAt: "asc" },
    include: { resource: { select: { title: true, slug: true } } },
  });
  return rows.map(mapRow);
}

export async function listRecentModeratedGallerySubmissions(
  limit = 20,
): Promise<GallerySubmissionRow[]> {
  const rows = await prisma.craftGallerySubmission.findMany({
    where: {
      OR: [{ isApproved: true }, { rejectedAt: { not: null } }],
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: { resource: { select: { title: true, slug: true } } },
  });
  return rows.map(mapRow);
}

export async function listApprovedGallerySubmissions(opts?: {
  resourceId?: string;
  limit?: number;
}) {
  const rows = await prisma.craftGallerySubmission.findMany({
    where: {
      isApproved: true,
      rejectedAt: null,
      ...(opts?.resourceId ? { resourceId: opts.resourceId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 48,
    select: {
      id: true,
      imageUrl: true,
      authorName: true,
      caption: true,
      createdAt: true,
    },
  });
  return rows;
}

export async function moderateGallerySubmission(opts: {
  id: string;
  action: "approve" | "reject";
  moderatorAdminUserId: string;
}) {
  const now = new Date();
  if (opts.action === "approve") {
    return prisma.craftGallerySubmission.update({
      where: { id: opts.id },
      data: {
        isApproved: true,
        rejectedAt: null,
        moderatedById: opts.moderatorAdminUserId,
        moderatedAt: now,
      },
    });
  }

  return prisma.craftGallerySubmission.update({
    where: { id: opts.id },
    data: {
      isApproved: false,
      rejectedAt: now,
      moderatedById: opts.moderatorAdminUserId,
      moderatedAt: now,
    },
  });
}
