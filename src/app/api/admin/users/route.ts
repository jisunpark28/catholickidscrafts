import { requireSuperAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "OPERATOR"]).optional(),
});

export async function GET() {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { error } = await requireSuperAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, role } = parsed.data;
  const exists = await prisma.adminUser.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      role: role ?? AdminRole.OPERATOR,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
