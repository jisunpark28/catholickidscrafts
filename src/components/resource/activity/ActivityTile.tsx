import { activityPath, type ResourceActivity } from "@/lib/resource/activities";
import { seasonLabel } from "@/lib/resource/sheets";
import Image from "next/image";
import Link from "next/link";

type Props = {
  activity: Pick<ResourceActivity, "slug" | "title" | "kind" | "summary" | "seasons" | "previews">;
  typeBadge?: React.ReactNode;
};

const pill = "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold no-underline";

/** Library tile for an activity, same shape as the sheet and card tiles. Free with sign-in. */
export function ActivityTile({ activity, typeBadge }: Props) {
  const href = activityPath(activity.slug);
  const season = activity.seasons[0];
  return (
    <div className="flex h-full flex-col rounded-xl border border-[#e7e3de] bg-white p-1.5">
      <Link href={href} className="block no-underline" tabIndex={-1}>
        <span className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-white">
          <Image
            src={activity.previews.color}
            alt=""
            width={600}
            height={776}
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 30vw, 46vw"
            className="block h-full w-full object-cover object-top"
          />
          {typeBadge ? <span className="absolute left-1.5 top-1.5">{typeBadge}</span> : null}
          <span className="absolute right-1.5 top-1.5 rounded-md bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e7b34]">
            FREE
          </span>
        </span>
      </Link>
      <span className="block px-1 pt-2">
        <span className="block text-xs font-bold tracking-wide text-[#d35400]">
          {activity.kind}
          {season ? ` · ${seasonLabel(season)}` : ""}
        </span>
        <span className="block truncate text-sm font-bold text-[#1c1c1c]">{activity.title}</span>
        <span className="block text-xs text-[#6b7280] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {activity.summary}
        </span>
      </span>
      <div className="mt-auto px-1 pb-1 pt-2.5">
        <Link href={href} className={`${pill} bg-[#d35400] text-white hover:bg-[#b8470a]`}>
          Open
        </Link>
        <p className="m-0 mt-1.5 text-xs text-[#6b7280]">Free with sign-in · Plus can edit</p>
      </div>
    </div>
  );
}
