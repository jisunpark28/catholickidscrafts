import { LessonPrintView } from "@/components/lesson/LessonPrintView";
import { LessonPrintToolbar } from "@/components/lesson/LessonPrintToolbar";
import { getLessonKitById, canEditLessonKit } from "@/lib/lesson-kit/db";
import { requireFamilySession } from "@/lib/family-auth";
import { notFound, redirect } from "next/navigation";
import "@/styles/lesson-kit.css";
import "@/styles/lesson-print.css";

type Props = { params: Promise<{ id: string }> };

export default async function LessonKitPrintPage({ params }: Props) {
  const session = await requireFamilySession();
  if (!session) redirect("/account/login?next=/program");

  const { id } = await params;
  const kit = await getLessonKitById(id);
  if (!kit || !(await canEditLessonKit(kit, session.familyAccountId))) {
    notFound();
  }

  return (
    <>
      <LessonPrintToolbar kitId={kit.id} />
      <LessonPrintView kit={kit} />
    </>
  );
}
