import Link from "next/link";
import type { ResourcePost } from "@/lib/content";

type Props = { post: ResourcePost };

export function ResourceCard({ post }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          {post.grade}
        </span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[#2563eb]">
          {post.topic}
        </span>
      </div>
      <h3 className="text-xl font-extrabold text-slate-800">
        <Link href={`/resources/${post.slug}`} className="hover:text-[#2563eb]">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
      <Link
        href={`/resources/${post.slug}`}
        className="mt-4 inline-block text-sm font-bold text-[#2563eb] hover:underline"
      >
        Read lesson →
      </Link>
    </article>
  );
}
