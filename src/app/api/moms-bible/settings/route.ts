import { parentApiGuard } from "@/lib/family-auth";
import { mbError, readJsonBody } from "@/lib/moms-bible/http";
import { ensureParentSettings } from "@/lib/moms-bible/notify";
import { cleanRoleLabel } from "@/lib/moms-bible/rules";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { NextResponse } from "next/server";

const MODES = new Set(["INSTANT", "DIGEST", "OFF"]);

/** PUT {emailMode?, roleLabel?}: this parent's reply-email setting and how notes are signed ("Mom"). */
export async function PUT(request: Request) {
  const bad = crossOriginError(request);
  if (bad) return bad;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const parentId = guard.session.familyAccountId;
  const parsed = await readJsonBody<{ emailMode?: unknown; roleLabel?: unknown }>(request);
  if (!parsed.ok) return parsed.res;
  const { emailMode, roleLabel } = parsed.body;
  if (emailMode !== undefined && (typeof emailMode !== "string" || !MODES.has(emailMode))) {
    return mbError(400, "Invalid email setting");
  }
  let label: string | null = null;
  if (roleLabel !== undefined) {
    label = cleanRoleLabel(roleLabel);
    if (!label) return mbError(400, "Use 1-20 letters, like Mom or Dad.");
  }
  await ensureParentSettings(parentId);
  if (emailMode !== undefined) {
    await prisma.mbParentSettings.update({
      where: { parentAccountId: parentId },
      data: { emailMode: emailMode as "INSTANT" | "DIGEST" | "OFF" },
    });
  }
  if (label) {
    await prisma.parentChildLink.updateMany({ where: { parentAccountId: parentId }, data: { roleLabel: label } });
  }
  return NextResponse.json({ ok: true });
}
