import { LiturgyCardsTabs } from "@/components/admin/LiturgyCardsTabs";
import { LiturgyQaManager } from "@/components/admin/LiturgyQaManager";
import { LiturgyWeeklyCardsManager } from "@/components/admin/LiturgyWeeklyCardsManager";
import { requireAdminPage } from "@/lib/admin-auth";

type Props = { searchParams: Promise<{ tab?: string; topic?: string; status?: string }> };

export default async function AdminLiturgyCardsPage({ searchParams }: Props) {
  await requireAdminPage();
  const params = await searchParams;
  const tab = params.tab === "qa" ? "qa" : "weekly";
  return (
    <div>
      <h1 className="text-2xl font-bold">Liturgy cards</h1>
      <LiturgyCardsTabs active={tab} />
      <div className="mt-6">
        {tab === "qa" ? (
          <LiturgyQaManager topic={params.topic} status={params.status} />
        ) : (
          <LiturgyWeeklyCardsManager topic={params.topic} />
        )}
      </div>
    </div>
  );
}
