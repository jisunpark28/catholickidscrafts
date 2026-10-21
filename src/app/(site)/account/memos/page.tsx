import { MyMemosClient, type MyMemo } from "@/components/account/MyMemosClient";
import { PageShell } from "@/components/PageShell";
import { ownerWhere, toMemoDto } from "@/lib/bible-memos/passage-memos";
import { CATHOLIC_BOOK_NAMES_EN } from "@/lib/bible/catholic-book-names/locale-data";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { prisma } from "@/lib/prisma";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My memos",
  description: "Your private memos on Bible passages.",
  robots: { index: false },
};

const BOOK_ORDER = Object.keys(CATHOLIC_BOOK_NAMES_EN);

export default async function MyMemosPage() {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) redirect("/account/login");
  const [rows, paid] = await Promise.all([
    prisma.biblePassageMemo.findMany({
      where: ownerWhere(key),
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    hasPaidFeatures(key),
  ]);
  const memos: MyMemo[] = rows.map((r) => {
    const idx = BOOK_ORDER.indexOf(r.bookSlug);
    return {
      ...toMemoDto(r),
      bookName: CATHOLIC_BOOK_NAMES_EN[r.bookSlug] ?? r.bookSlug,
      bookOrder: idx === -1 ? 999 : idx,
    };
  });

  return (
    <PageShell wide>
      <MyMemosClient initialMemos={memos} paid={paid} />
    </PageShell>
  );
}
