import { HomePdfShell } from "@/components/home/HomePdfShell";
import { ActivityDownloadPanel } from "@/components/resource/activity/ActivityDownloadPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { activityPath, getActivity, RESOURCE_ACTIVITIES } from "@/lib/resource/activities";
import { seasonLabel, seasonPath } from "@/lib/resource/sheets";
import { pageMetadata } from "@/lib/site-metadata";
import { absoluteSiteUrl, breadcrumbNode, organizationId, SITE_NAME } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

// Static per activity: no cookies or DB here. Sign-in state loads in the browser and the
// PDF / editor APIs check the session (and Plus) on every request.
export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCE_ACTIVITIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) return {};
  return pageMetadata({
    title: activity.seoTitle,
    description: activity.description,
    path: activityPath(activity.slug),
    image: { url: activity.previews.color, width: 600, height: 776, alt: `${activity.title} ${activity.kind.toLowerCase()}` },
  });
}

export default async function ActivityPage({ params }: Props) {
  const { slug } = await params;
  const activity = getActivity(slug);
  if (!activity) notFound();
  const path = activityPath(activity.slug);
  const season = activity.seasons[0] ?? null;

  return (
    <HomePdfShell groups={[]}>
      <JsonLd
        nodes={[
          breadcrumbNode([
            { name: "Resource", path: "/resource" },
            { name: "Activities", path: "/resource?view=all" },
            { name: activity.title, path },
          ]),
          {
            "@type": "LearningResource",
            name: activity.title,
            description: activity.description,
            learningResourceType: [activity.kind, "Activity"],
            isAccessibleForFree: activity.access === "signin",
            inLanguage: "en",
            url: absoluteSiteUrl(path),
            image: absoluteSiteUrl(activity.previews.color),
            author: { "@type": "Organization", name: SITE_NAME, url: absoluteSiteUrl("/") },
            provider: { "@id": organizationId() },
          },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-[#6b7280]">
        <Link href="/resource">Resource</Link>
        {" > "}
        <Link href="/resource?view=all">Activities</Link>
        {" > "}
        {activity.title}
      </nav>
      <header className="mt-4">
        <p className="m-0 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#d35400]">
          <span className="rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] text-[#1e7b34]">Activity</span>
          {activity.kind}
          {season ? (
            <>
              {" · "}
              <Link href={seasonPath(season)} className="text-[#d35400] no-underline hover:underline">
                {seasonLabel(season)}
              </Link>
            </>
          ) : null}
        </p>
        <h1 className="mb-1 mt-1.5 text-2xl font-bold text-[#1c1c1c]">{activity.title}</h1>
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-[#4b5563]">{activity.summary}</p>
      </header>

      <ActivityDownloadPanel activity={activity} />
    </HomePdfShell>
  );
}
