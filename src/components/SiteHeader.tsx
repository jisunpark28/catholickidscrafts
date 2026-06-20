import { getHeaderSession } from "@/lib/header-session";
import { HomeHubHeader } from "@/components/HomeHubHeader";

/** Public site header — search, logo, and menu on every page (home + sub-pages). */
export async function SiteHeader() {
  const initialSession = await getHeaderSession();
  return <HomeHubHeader initialSession={initialSession} />;
}
