import { parentApiGuard } from "@/lib/family-auth";
import { mbError, MB_INVITE_RULE, readJsonBody, writeRateLimit } from "@/lib/moms-bible/http";
import { hashInviteToken, isInviteTokenShape } from "@/lib/moms-bible/invites";
import { canAcceptInvite } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

const INVALID = "This invite link isn't valid. Ask for a new one.";

/** POST {token}: the signed-in parent (e.g. Dad) accepts an invite and is linked to the children. */
export async function POST(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const me = guard.session.familyAccountId;
  const limited = await writeRateLimit(`mb:invite-accept:${me}`, MB_INVITE_RULE);
  if (limited) return limited;
  const parsed = await readJsonBody<{ token?: unknown }>(request);
  if (!parsed.ok) return parsed.res;
  if (!isInviteTokenShape(parsed.body.token)) return mbError(400, INVALID);

  const invite = await prisma.parentInvite.findUnique({ where: { tokenHash: hashInviteToken(parsed.body.token) } });
  if (!invite) return mbError(404, INVALID);
  const now = new Date();
  const check = canAcceptInvite(
    { expiresAt: invite.expiresAt, acceptedAt: invite.acceptedAt, ownerAccountId: invite.ownerAccountId, acceptorId: me },
    now,
  );
  if (!check.ok) return mbError(400, check.error);

  // Children must still belong to the inviting parent and be active.
  const children = await prisma.subProfile.findMany({
    where: { id: { in: invite.subProfileIds }, familyAccountId: invite.ownerAccountId, active: true },
    select: { id: true, displayName: true },
  });
  if (children.length === 0) return mbError(400, INVALID);

  const ok = await prisma.$transaction(async (tx) => {
    const claim = await tx.parentInvite.updateMany({
      where: { id: invite.id, acceptedAt: null, expiresAt: { gt: now } },
      data: { acceptedAt: now, acceptedById: me },
    });
    if (claim.count !== 1) return false;
    for (const c of children) {
      await tx.parentChildLink.upsert({
        where: { parentAccountId_subProfileId: { parentAccountId: me, subProfileId: c.id } },
        create: { parentAccountId: me, subProfileId: c.id, roleLabel: invite.roleLabel, isOwner: false },
        update: {},
      });
    }
    return true;
  });
  if (!ok) return mbError(400, "This invite was already used.");
  return NextResponse.json({ ok: true, children: children.map((c) => c.displayName) });
}
