/**
 * Upsert only the Holy Trinity clover Kids Resource (no admin password needed).
 *
 *   npx tsx prisma/seed-holy-trinity-resource.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slug = "holy-trinity-clover";

async function main() {
  const file = path.join(process.cwd(), "content", "resources", `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  await prisma.resource.upsert({
    where: { slug },
    update: {
      title: (data.title as string) ?? slug,
      excerpt: (data.excerpt as string) ?? "",
      content,
      grade: (data.grade as string) ?? "Grade 2-4",
      topic: (data.topic as string) ?? "Doctrine",
      liturgicalPeriod: (data.liturgicalPeriod as string) ?? "general",
      previewImageUrl: (data.previewImageUrl as string) ?? null,
      downloadLabel: (data.downloadLabel as string) ?? null,
      downloadUrl: (data.downloadUrl as string) ?? null,
      isFreeSample: data.isFreeSample !== false,
      published: true,
      contentFormat: "markdown",
    },
    create: {
      slug,
      title: (data.title as string) ?? slug,
      excerpt: (data.excerpt as string) ?? "",
      content,
      grade: (data.grade as string) ?? "Grade 2-4",
      topic: (data.topic as string) ?? "Doctrine",
      liturgicalPeriod: (data.liturgicalPeriod as string) ?? "general",
      previewImageUrl: (data.previewImageUrl as string) ?? null,
      downloadLabel: (data.downloadLabel as string) ?? null,
      downloadUrl: (data.downloadUrl as string) ?? null,
      isFreeSample: data.isFreeSample !== false,
      published: true,
      contentFormat: "markdown",
    },
  });

  console.log(`Resource upserted: /resources/${slug}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
