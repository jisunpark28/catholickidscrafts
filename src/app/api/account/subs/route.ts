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
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function uniqueAccessCode(): Promise<string> {
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
  throw new Error("Could not generate unique Access ID");
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
  const guard = await parentApiGuard();
  if (guard.error) return guard.error;
  const { session } = guard;

  let body: { displayName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const displayName = body.displayName?.trim();
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

  const normalized = await uniqueAccessCode();
  const accessCodeHash = await hashAccessCode(normalized);

  const sub = await prisma.subProfile.create({
    data: {
      familyAccountId: session.familyAccountId,
      displayName,
      accessCodeHash,
      accessCodeLookup: accessCodeLookupKey(normalized),
      accessCodeLast4: accessCodeLast4(normalized),
      sortOrder: count,
      active: true,
    },
    select: { id: true, displayName: true, accessCodeLast4: true },
  });

  return NextResponse.json({
    sub,
    /** Shown once — store securely; only a hash is saved. */
    accessId: normalized,
  });
}
