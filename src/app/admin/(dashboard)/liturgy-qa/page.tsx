import { requireAdminPage } from "@/lib/admin-auth";
import { qaListHref } from "@/lib/admin-liturgy-paths";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ topic?: string; status?: string }> };

/** Old URL: Q&A management now lives in a tab on /admin/liturgy-cards. */
export default async function AdminLiturgyQaRedirect({ searchParams }: Props) {
  await requireAdminPage();
  const { topic, status } = await searchParams;
  redirect(qaListHref(topic, status));
}
