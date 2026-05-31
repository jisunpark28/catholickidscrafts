import { ResourceCard } from "@/components/ResourceCard";
import { getAllResources } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description: "All Catholic kids catechism lesson plans and craft ideas.",
};

export default function ResourcesPage() {
  const posts = getAllResources();

  return (
    <div className="min-h-screen bg-[#131217] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-extrabold tracking-tight">Resources</h1>
        <p className="mt-4 max-w-2xl text-gray-400">
          Lesson plans and activities published as Markdown in the{" "}
          <code className="rounded bg-[#1a1921] px-1.5 py-0.5 text-sm text-[#dfb24f]">
            content/resources
          </code>{" "}
          folder—add a file, push to GitHub, and Vercel redeploys.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <ResourceCard key={post.slug} post={post} />
          ))}
        </div>
        {posts.length === 0 && (
          <p className="mt-8 text-gray-500">No resources published yet.</p>
        )}
      </div>
    </div>
  );
}
