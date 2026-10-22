import { requireFamilySession, requireParentActive } from "@/lib/family-auth";
import { redirect } from "next/navigation";

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireFamilySession();
  if (!session) redirect("/account/login");
  // Child mode: the family dashboard is parent-only.
  if (!(await requireParentActive())) redirect("/");
  return children;
}
