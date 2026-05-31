import Link from "next/link";
import type { ResourcePost } from "@/lib/content";

type Props = { post: ResourcePost };

export function ResourceCard({ post }: Props) {
  return (
    <article className="border-b border-[var(--color-border)] bg-white p-6 last:border-b-0 sm:p-8">
      <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        <span>{post.grade}</span>
        <span>·</span>
        <span>{post.topic}</span>
      </div>
      <h3 className="text-lg font-bold text-[var(--color-ink)]">
        <Link href={`/resources/${post.slug}`} className="hover:text-[var(--color-accent)]">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 text-[var(--color-muted)]">{post.excerpt}</p>
      <Link
        href={`/resources/${post.slug}`}
        className="mt-4 inline-block text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        Open resource
      </Link>
    </article>
  );
}
