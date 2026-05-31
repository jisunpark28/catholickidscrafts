import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllResourceSlugs, getResourceBySlug } from "@/lib/content";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getResourceBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const post = getResourceBySlug(slug);
  if (!post) notFound();

  return (
    <article className="min-h-screen bg-[#131217] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/resources"
          className="text-sm font-medium text-[#dfb24f] hover:underline"
        >
          ← All resources
        </Link>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
          <span className="rounded bg-[#1a1921] px-2 py-1 text-[#7c6a85]">
            {post.grade}
          </span>
          <span className="rounded bg-[#1a1921] px-2 py-1 text-[#dfb24f]">
            {post.topic}
          </span>
          {post.date && (
            <span className="rounded bg-[#1a1921] px-2 py-1 text-gray-500">
              {post.date}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#fcfaf2]">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-gray-400">{post.excerpt}</p>

        {post.downloadUrl && (
          <a
            href={post.downloadUrl}
            className="mt-8 inline-block rounded-md bg-[#dfb24f] px-6 py-3 font-bold text-[#131217] transition hover:bg-[#ebd07f]"
            download
          >
            {post.downloadLabel ?? "Download printable"}
          </a>
        )}

        <div className="prose-catechism mt-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
