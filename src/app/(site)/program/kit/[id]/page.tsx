import { LessonKitEditor } from "@/components/lesson/LessonKitEditor";
import { getLessonKitById } from "@/lib/lesson-kit/db";
import { getLessonKitForkAttribution } from "@/lib/lesson-kit/community";
import { requireFamilySession } from "@/lib/family-auth";
import { PageShell } from "@/components/PageShell";
import { redirect, notFound } from "next/navigation";
import "@/styles/lesson-kit.css";

type Props = { params: Promise<{ id: string }> };

export default async function ProgramKitEditPage({ params }: Props) {
  const session = await requireFamilySession();
  if (!session) {
    redirect("/account/login?next=/program");
  }
  const { id } = await params;
  const kit = await getLessonKitById(id);
  if (!kit || kit.familyAccountId !== session.familyAccountId) {
    notFound();
  }

  const forkAttribution = kit.sourceKitId
    ? await getLessonKitForkAttribution(kit.sourceKitId)
    : null;

  return (
    <PageShell>
      <LessonKitEditor initialKit={kit} forkAttribution={forkAttribution} />
    </PageShell>
  );
}
