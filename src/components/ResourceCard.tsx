import type { ReactNode } from "react";
import { ResourceDownloadButton } from "@/components/ResourceDownloadButton";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { ResourcePost } from "@/lib/content";
import Link from "next/link";

type Props = {
  post: ResourcePost;
  variant?: "list" | "floating";
};

function resourceInitial(title: string): string {
  const ch = title.trim().charAt(0);
  return ch ? ch.toUpperCase() : "?";
}

function ResourceThumbnail({ post }: { post: ResourcePost }) {
  const src = resolveAssetUrl(post.previewImageUrl);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-[var(--color-accent)]/8 px-4 text-center"
      aria-hidden
    >
      <span className="text-4xl font-bold text-[var(--color-accent)]/70">
        {resourceInitial(post.title)}
      </span>
      <span className="mt-2 line-clamp-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {post.topic}
      </span>
    </div>
  );
}

function FloatingResourceCard({ post }: { post: ResourcePost }) {
  const downloadHref = post.downloadUrl?.trim();
  const detailHref = `/resources/${post.slug}`;

  return (
    <article className="group relative flex flex-col rounded-3xl bg-white p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--color-surface)]">
          <ResourceThumbnail post={post} />
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
            {post.grade} · {post.topic}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-[var(--color-ink)]">
            <Link href={detailHref} className="hover:text-[var(--color-accent)]">
              {post.title}
            </Link>
          </h3>
          {post.tptUrl && post.isFreeSample ? (
            <p className="mt-1 text-xs font-semibold text-[var(--color-accent)]">
              Free preview · Full pack on TPT
            </p>
          ) : null}
        </div>

        {downloadHref ? (
          <ResourceDownloadButton
            slug={post.slug}
            href={downloadHref}
            label={post.downloadLabel?.trim() || `Download ${post.title}`}
          />
        ) : (
          <Link
            href={detailHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-sm font-bold text-[var(--color-link)] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
            aria-label={`Open ${post.title}`}
          >
            →
          </Link>
        )}
      </div>
    </article>
  );
}

function ListResourceCard({ post }: { post: ResourcePost }) {
  return (
    <article className="border-b border-[var(--color-border)] bg-white p-6 last:border-b-0 sm:p-8">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">
        <span>{post.grade}</span>
        <span>·</span>
        <span>{post.topic}</span>
        {post.tptUrl && post.isFreeSample && (
          <>
            <span>·</span>
            <span className="text-[var(--color-accent)]">Free preview · Full pack on TPT</span>
          </>
        )}
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

export function ResourceCard({ post, variant = "floating" }: Props) {
  if (variant === "list") {
    return <ListResourceCard post={post} />;
  }
  return <FloatingResourceCard post={post} />;
}

export function ResourceCardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
