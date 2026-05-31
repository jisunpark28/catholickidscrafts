import Link from "next/link";
import type { ResourcePost } from "@/lib/content";

type Props = { post: ResourcePost };

export function ResourceCard({ post }: Props) {
  return (
    <article className="rounded-xl border border-gray-800 bg-[#1a1921] p-6 transition hover:border-[#7c6a85]">
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
        <span className="rounded bg-[#131217] px-2 py-1 text-[#7c6a85]">
          {post.grade}
        </span>
        <span className="rounded bg-[#131217] px-2 py-1 text-[#dfb24f]">
          {post.topic}
        </span>
      </div>
      <h3 className="text-xl font-bold">
        <Link href={`/resources/${post.slug}`} className="hover:text-[#dfb24f]">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-gray-400">{post.excerpt}</p>
      <Link
        href={`/resources/${post.slug}`}
        className="mt-4 inline-block text-sm font-bold text-[#dfb24f] hover:underline"
      >
        Read lesson →
      </Link>
    </article>
  );
}
