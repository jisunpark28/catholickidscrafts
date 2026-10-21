import { MyMemosClient, type MyMemo } from "@/components/account/MyMemosClient";
import { PageShell } from "@/components/PageShell";
import { withBookInfo } from "@/lib/bible-memos/book-info";
import { familyChildren, loadVisibleMemos, resolveMemoViewer } from "@/lib/bible-memos/memo-access";
import { getReaderKey, isSignedInReaderKey } from "@/lib/bible/reader";
import { hasPaidFeatures } from "@/lib/subscription/entitlements";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My memos",
  description: "Your memos on Bible passages, plus memos your family shared.",
  robots: { index: false },
};

export default async function MyMemosPage() {
  const key = await getReaderKey();
  if (!isSignedInReaderKey(key)) redirect("/account/login");
  const viewer = await resolveMemoViewer(key);
  if (!viewer) redirect("/account/login");
  const [dtos, paid, kids] = await Promise.all([
    loadVisibleMemos(viewer),
    hasPaidFeatures(key),
    viewer.isParent ? familyChildren(viewer.familyAccountId) : Promise.resolve([]),
  ]);
  const memos: MyMemo[] = dtos.map(withBookInfo);

  return (
    <PageShell>
      <MyMemosClient
        initialMemos={memos}
        paid={paid}
        viewer={{ name: viewer.name, isParent: viewer.isParent }}
        people={kids.map((k) => ({ id: k.id, name: k.displayName }))}
      />
    </PageShell>
  );
}
