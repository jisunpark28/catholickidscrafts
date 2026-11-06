import { EvergreenWorksheetDetail } from "@/components/seo/EvergreenWorksheetDetail";
import {
  evergreenDescription,
  evergreenPages,
  evergreenSeoTitle,
  getEvergreenPageBySlug,
  getEvergreenSheet,
  publicPath,
} from "@/lib/seo/evergreen-worksheets";
import { pageMetadata } from "@/lib/site-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return evergreenPages("mass").map((p) => ({ slug: p.slug }));
}

function resolve(slug: string) {
  const page = getEvergreenPageBySlug(slug);
  return page && page.kind === "mass" ? page : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = resolve((await params).slug);
  const sheet = page ? getEvergreenSheet(page.key) : null;
  if (!page || !sheet) return {};
  return pageMetadata({
    title: evergreenSeoTitle(page),
    absoluteTitle: true,
    description: evergreenDescription(page, sheet),
    path: publicPath(page),
  });
}

export default async function Page({ params }: Props) {
  const page = resolve((await params).slug);
  if (!page) notFound();
  return <EvergreenWorksheetDetail page={page} />;
}
