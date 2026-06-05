import "dotenv/config";
import { AdminRole, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { seedHangmanWords } from "./seed-hangman-words";
import { seedMassOrderSteps } from "./seed-mass-order-steps";
import { seedSiteCopy } from "./seed-site-copy";
import { seedTypingWords } from "./seed-typing-words";

const prisma = new PrismaClient();

const curriculumTracks = [
  {
    slug: "pre-k-kindergarten",
    stage: "Stage 1",
    title: "Pre-K & Kindergarten",
    description:
      "Sensory crafts, saint stories, and simple coloring pages for little ones beginning their faith journey.",
    lessonCount: 12,
    sortOrder: 1,
  },
  {
    slug: "first-holy-communion",
    stage: "Stage 2",
    title: "First Holy Communion",
    description:
      "Reconciliation and Eucharist prep for early elementary—worksheets, games, and lesson plans teachers love.",
    lessonCount: 18,
    sortOrder: 2,
  },
  {
    slug: "grades-3-5",
    stage: "Stage 3",
    title: "Grades 3–5",
    description:
      "Deeper catechism topics, Gospel-based quizzes, and liturgical year activities for upper elementary.",
    lessonCount: 15,
    sortOrder: 3,
  },
  {
    slug: "liturgical-year",
    stage: "Overview",
    title: "Liturgical Year Overview",
    description:
      "How Advent, Christmas, Lent, Easter, and Ordinary Time fit together in parish life.",
    lessonCount: 8,
    sortOrder: 4,
  },
];


function optionalBool(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function parsePeriod(value: unknown): string {
  const valid = [
    "advent",
    "christmas",
    "lent",
    "holy-week",
    "easter",
    "ordinary",
    "general",
  ];
  if (typeof value === "string" && valid.includes(value)) return value;
  return "general";
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const adminName = process.env.ADMIN_NAME ?? "Site Owner";
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: AdminRole.SUPER_ADMIN, name: adminName },
    create: { email, passwordHash, role: AdminRole.SUPER_ADMIN, name: adminName },
  });
  console.log(`Admin user: ${email}`);

  for (const track of curriculumTracks) {
    await prisma.curriculumTrack.upsert({
      where: { slug: track.slug },
      update: track,
      create: { ...track, body: "", published: true },
    });
  }
  console.log(`Curriculum tracks: ${curriculumTracks.length}`);

  const resourcesDir = path.join(process.cwd(), "content", "resources");
  if (fs.existsSync(resourcesDir)) {
    const files = fs.readdirSync(resourcesDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(resourcesDir, file), "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      await prisma.resource.upsert({
        where: { slug },
        update: {
          title: (data.title as string) ?? slug,
          excerpt: (data.excerpt as string) ?? "",
          content,
          grade: (data.grade as string) ?? "All",
          topic: (data.topic as string) ?? "General",
          liturgicalPeriod: parsePeriod(data.liturgicalPeriod ?? data.season),
          downloadLabel: optionalString(data.downloadLabel) ?? null,
          downloadUrl: optionalString(data.downloadUrl) ?? null,
          previewImageUrl: optionalString(data.previewImageUrl) ?? null,
          tptUrl: optionalString(data.tptUrl) ?? null,
          isFreeSample: optionalBool(data.isFreeSample) ?? true,
          published: true,
          contentFormat: "markdown",
        },
        create: {
          slug,
          title: (data.title as string) ?? slug,
          excerpt: (data.excerpt as string) ?? "",
          content,
          grade: (data.grade as string) ?? "All",
          topic: (data.topic as string) ?? "General",
          liturgicalPeriod: parsePeriod(data.liturgicalPeriod ?? data.season),
          downloadLabel: optionalString(data.downloadLabel) ?? null,
          downloadUrl: optionalString(data.downloadUrl) ?? null,
          previewImageUrl: optionalString(data.previewImageUrl) ?? null,
          tptUrl: optionalString(data.tptUrl) ?? null,
          isFreeSample: optionalBool(data.isFreeSample) ?? true,
          published: true,
          contentFormat: "markdown",
        },
      });
    }
    console.log(`Resources from markdown: ${files.length}`);
  }

  const typingCount = await seedTypingWords(prisma);
  console.log(`Typing words seeded: ${typingCount}`);

  const hangmanCount = await seedHangmanWords(prisma);
  console.log(`Hangman words seeded: ${hangmanCount}`);

  const massOrderCount = await seedMassOrderSteps(prisma);
  console.log(`Mass order steps seeded: ${massOrderCount}`);

  const siteCopyCount = await seedSiteCopy(prisma);
  console.log(`Site copy seeded: ${siteCopyCount}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
