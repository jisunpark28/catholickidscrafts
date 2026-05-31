import { ResourceCard } from "@/components/ResourceCard";
import { getAllResources } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kids Resources",
  description: "Catholic kids catechism lesson plans and craft ideas.",
};

export default function ResourcesPage() {
  const posts = getAllResources();

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-extrabold text-slate-800">Kids resources</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Lesson plans and activities in Markdown—add files under{" "}
          <code className="rounded-lg bg-white px-2 py-0.5 text-sm text-[#2563eb]">
            content/resources
          </code>
          .
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <ResourceCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
