import {
  accessCodeLast4,
  accessCodeLookupKey,
  generateAccessCode,
  hashAccessCode,
  isValidAccessCodeFormat,
  MAX_SUB_PROFILES_PER_FAMILY,
  normalizeAccessCode,
} from "@/lib/access-code";
import { loadAccountDashboardReaders } from "@/lib/account-dashboard";
import { parentApiGuard } from "@/lib/family-auth";
import { KID_CODE_TAKEN_ERROR, resolveNewKidCode } from "@/lib/kids/kid-code";
import { memoImportOffer } from "@/lib/moms-bible/memo-import-server";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Legacy Access ID columns are still NOT NULL (dropped in a later cleanup migration), so new
 * children get a random Access ID that is never shown and can't be used: the Access ID
 * sign-in endpoint is retired (410) since Mom's Bible PR-2.
 */
async function unusedLegacyAccessCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateAccessCode();
    const normalized = normalizeAccessCode(code);
    const lookup = accessCodeLookupKey(normalized);
    const existing = await prisma.subProfile.findUnique({
      where: { accessCodeLookup: lookup },
      select: { id: true },
    });
    if (!existing && isValidAccessCodeFormat(normalized)) return normalized;
  }
  throw new Error("Could not generate a unique legacy code");
}

export async function GET() {
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;

  const { owner, subs } = await loadAccountDashboardReaders(session.familyAccountId);

  return NextResponse.json({
    owner,
    subs,
    maxSubs: MAX_SUB_PROFILES_PER_FAMILY,
  });
}

export async function POST(request: Request) {
  const originError = crossOriginError(request);
  if (originError) return originError;
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;

  let body: { displayName?: string; kidCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  const count = await prisma.subProfile.count({
    where: { familyAccountId: session.familyAccountId },
  });
  if (count >= MAX_SUB_PROFILES_PER_FAMILY) {
    return NextResponse.json(
      { error: `A family account can have up to ${MAX_SUB_PROFILES_PER_FAMILY} children. Delete a profile to add a new one.` },
      { status: 400 },
    );
  }

  // Kid Code for sign-in: the child's name letters ("lily"), or a letters-only code the parent
  // types when the name gives none or it is taken. The PIN is set by the parent next.
  const picked = await resolveNewKidCode(
    displayName,
    typeof body.kidCode === "string" ? body.kidCode.slice(0, 40) : null,
    async (code) => Boolean(await prisma.subProfile.findUnique({ where: { kidCode: code }, select: { id: true } })),
  );
  if (!picked.ok) {
    return NextResponse.json({ error: picked.error, needsKidCode: true }, { status: 409 });
  }
  const kidCode = picked.code;

  const legacy = await unusedLegacyAccessCode();
  const accessCodeHash = await hashAccessCode(legacy);

  let sub: { id: string; displayName: string; kidCode: string };
  try {
    sub = await prisma.subProfile.create({
      data: {
        familyAccountId: session.familyAccountId,
        displayName,
        accessCodeHash,
        accessCodeLookup: accessCodeLookupKey(legacy),
        accessCodeLast4: accessCodeLast4(legacy),
        kidCode,
        sortOrder: count,
        active: true,
        parentLinks: {
          create: { parentAccountId: session.familyAccountId, roleLabel: "Parent", isOwner: true },
        },
      },
      select: { id: true, displayName: true, kidCode: true },
    });
  } catch (e) {
    // Another child took the same code a moment ago.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002" &&
      String(e.meta?.target ?? "").includes("kidCode")
    ) {
      return NextResponse.json({ error: KID_CODE_TAKEN_ERROR, needsKidCode: true }, { status: 409 });
    }
    throw e;
  }

  // First child: offer to move the parent's existing Bible memos into this child's Bible.
  const memoImport = count === 0 ? await memoImportOffer(session.familyAccountId).catch(() => null) : null;

  return NextResponse.json({ sub, kidCode: sub.kidCode, ...(memoImport ? { memoImport } : {}) }, { status: 201 });
}
