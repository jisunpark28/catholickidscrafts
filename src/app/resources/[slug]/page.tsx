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
  return { title: post.title, description: post.excerpt };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const post = getResourceBySlug(slug);
  if (!post) notFound();

  return (
    <article className="min-h-screen bg-[#f8fafc] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/resources"
          className="text-sm font-semibold text-[#2563eb] hover:underline"
        >
          ← All resources
        </Link>
        <h1 className="mt-6 text-4xl font-extrabold text-slate-900">{post.title}</h1>
        <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>
        <div className="prose-catechism mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
