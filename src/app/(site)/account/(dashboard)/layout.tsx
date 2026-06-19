import { requireFamilySession } from "@/lib/family-auth";
import { redirect } from "next/navigation";

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireFamilySession();
  if (!session) redirect("/account/login");
  return children;
}
