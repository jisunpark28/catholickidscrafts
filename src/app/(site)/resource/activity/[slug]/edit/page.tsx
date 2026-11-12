import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ActivityEditorGate } from "@/components/resource/activity/ActivityEditorGate";
import { activityEditPath, activityPath, getActivity, RESOURCE_ACTIVITIES } from "@/lib/resource/activities";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

// Static shell; the editable sheet loads from the Plus-checked API in the browser.
export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCE_ACTIVITIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) return {};
  return pageMetadata({
    title: `Edit ${activity.title}`,
    description: `Plus editor for the ${activity.title} coloring sheet.`,
    path: activityEditPath(activity.slug),
    robots: { index: false, follow: true },
  });
}

export default async function ActivityEditPage({ params }: Props) {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) notFound();
  return (
    <HomePdfShell groups={[]}>
      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280] print:hidden">
        <Link href="/resource">Resource</Link>
        {" > "}
        <Link href={activityPath(activity.slug)}>{activity.title}</Link>
        {" > "}Edit
      </nav>
      <header className="mt-3 print:hidden">
        <h1 className="m-0 flex flex-wrap items-center gap-2 text-xl font-bold text-[#1c1c1c]">
          Edit: {activity.title}
          <span className="rounded-md bg-[#d35400] px-1.5 py-0.5 text-[10px] font-bold text-white">PLUS</span>
        </h1>
        <p className="m-0 mt-1 text-sm text-[#6b7280]">
          Every line, dot, shape and word is editable. Your changes stay on this device until you reset.
        </p>
      </header>
      <ActivityEditorGate slug={activity.slug} title={activity.title} />
    </HomePdfShell>
  );
}
