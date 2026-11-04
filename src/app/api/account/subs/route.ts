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
import { generateUniqueKidCode } from "@/lib/kids/kid-code";
import { prisma } from "@/lib/prisma";
import { crossOriginError } from "@/lib/same-origin";
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

  let body: { displayName?: string };
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

  const legacy = await unusedLegacyAccessCode();
  const accessCodeHash = await hashAccessCode(legacy);
  // Kid Code for sign-in. The PIN is set by the parent next (the child can't sign in before that).
  const kidCode = await generateUniqueKidCode(displayName, async (code) =>
    Boolean(await prisma.subProfile.findUnique({ where: { kidCode: code }, select: { id: true } })),
  );

  const sub = await prisma.subProfile.create({
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

  return NextResponse.json({ sub, kidCode: sub.kidCode });
}
