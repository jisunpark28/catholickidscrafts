import { HomeSectionsManager } from "@/components/admin/HomeSectionsManager";
import { getAllHomeSectionsForAdmin } from "@/lib/home-sections";

export default async function AdminHomeSectionsPage() {
  const sections = await getAllHomeSectionsForAdmin();
  return <HomeSectionsManager initialSections={sections} />;
}
