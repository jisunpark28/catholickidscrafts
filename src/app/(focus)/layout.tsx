import { SiteCopyProvider } from "@/components/SiteCopyProvider";
import { VisitTracker } from "@/components/VisitTracker";
import { getSiteCopyMap } from "@/lib/site-copy";
import "@/styles/lesson-kit.css";

export default async function FocusLayout({ children }: { children: React.ReactNode }) {
  const copy = await getSiteCopyMap();
  return (
    <SiteCopyProvider copy={copy}>
      <VisitTracker />
      <div className="lesson-runner-shell">{children}</div>
    </SiteCopyProvider>
  );
}
