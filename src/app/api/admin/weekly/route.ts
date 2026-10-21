import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/weekly-content";
import { itemsCreateData, weeklyIssueSchema } from "@/lib/weekly-schema";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const parsed = weeklyIssueSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const sundayDate = parseDateInput(data.sundayDate);
  if (!sundayDate) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  try {
    const issue = await prisma.weeklyIssue.create({
      data: {
        sundayDate,
        title: data.title,
        season: data.season,
        cycle: data.cycle,
        gospelRef: data.gospelRef,
        color: data.color,
        published: data.published,
        items: { create: itemsCreateData(data.items) },
      },
    });
    return NextResponse.json(issue);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "An issue for that Sunday already exists" }, { status: 409 });
    }
    throw e;
  }
}