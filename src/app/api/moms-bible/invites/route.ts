import { parentApiGuard } from "@/lib/family-auth";
import { MB_LIMITS } from "@/lib/moms-bible/constants";
import { mbError, MB_INVITE_RULE, parseId, readJsonBody, writeRateLimit } from "@/lib/moms-bible/http";
import { newInviteToken } from "@/lib/moms-bible/invites";
import { cleanRoleLabel, MB_INVITE_TTL_MS } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { siteBase } from "@/lib/email";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** GET: the owner's pending invites and the co-parents linked to their children. */
export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const ownerId = guard.session.familyAccountId;
  const [invites, links] = await Promise.all([
    prisma.parentInvite.findMany({
      where: { ownerAccountId: ownerId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, roleLabel: true, subProfileIds: true, expiresAt: true },
    }),
    prisma.parentChildLink.findMany({
      where: { isOwner: false, child: { familyAccountId: ownerId } },
      select: {
        id: true,
        roleLabel: true,
        parent: { select: { email: true } },
        child: { select: { displayName: true } },
      },
    }),
  ]);
  return NextResponse.json(
    {
      invites: invites.map((i) => ({ ...i, expiresAt: i.expiresAt.toISOString() })),
      links: links.map((l) => ({ id: l.id, roleLabel: l.roleLabel, email: l.parent.email, childName: l.child.displayName })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * POST {childIds[], roleLabel}: the owning parent invites another parent (e.g. Dad) to these
 * children. Returns the link ONCE; only a hash is stored. Single use, 7 days.
 */
export async function POST(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const ownerId = guard.session.familyAccountId;
  const parsed = await readJsonBody<{ childIds?: unknown; roleLabel?: unknown }>(request);
  if (!parsed.ok) return parsed.res;
  const raw = parsed.body.childIds;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MB_LIMITS.alsoSendTo + 1) return mbError(400, "Pick a child");
  const ids = [...new Set(raw.map(parseId))];
  if (ids.some((x) => !x)) return mbError(400, "Pick a child");
  const roleLabel = cleanRoleLabel(parsed.body.roleLabel ?? "Dad");
  if (!roleLabel) return mbError(400, "Use 1-20 letters, like Dad.");
  const owned = await prisma.subProfile.count({ where: { id: { in: ids as string[] }, familyAccountId: ownerId, active: true } });
  if (owned !== ids.length) return mbError(404, "Not found");
  const limited = await writeRateLimit(`mb:invite:${ownerId}`, MB_INVITE_RULE);
  if (limited) return limited;
  const { token, tokenHash } = newInviteToken();
  await prisma.parentInvite.create({
    data: {
      ownerAccountId: ownerId,
      subProfileIds: ids as string[],
      roleLabel,
      tokenHash,
      expiresAt: new Date(Date.now() + MB_INVITE_TTL_MS),
    },
  });
  return NextResponse.json({ ok: true, url: `${siteBase()}/moms-bible/invite#${token}` }, { status: 201 });
}

/** DELETE ?id=: revoke a pending invite. */
export async function DELETE(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const id = parseId(new URL(request.url).searchParams.get("id"));
  if (!id) return mbError(404, "Not found");
  const res = await prisma.parentInvite.deleteMany({
    where: { id, ownerAccountId: guard.session.familyAccountId, acceptedAt: null },
  });
  if (res.count === 0) return mbError(404, "Not found");
  return NextResponse.json({ ok: true });
}
