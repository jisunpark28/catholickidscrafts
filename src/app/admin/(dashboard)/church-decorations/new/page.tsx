import { ChurchDecorationEditor } from "@/components/admin/ChurchDecorationEditor";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NewChurchDecorationPage() {
  const occupied = await prisma.churchDecoration.findMany({
    select: { id: true, title: true, sortOrder: true },
  });

  return (
    <div>
      <Link
        href="/admin/church-decorations"
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Church decorations
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New church decoration</h1>
      <div className="mt-6">
        <ChurchDecorationEditor occupied={occupied} />
      </div>
    </div>
  );
}
