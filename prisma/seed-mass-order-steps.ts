import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { MASS_ORDER_STEPS } from "./data/mass-order-steps";

const prisma = new PrismaClient();

export async function seedMassOrderSteps(client: PrismaClient = prisma) {
  let upserted = 0;
  for (const step of MASS_ORDER_STEPS) {
    await client.massOrderStep.upsert({
      where: { stepIndex: step.stepIndex },
      update: {
        part: step.part,
        partEn: step.partEn,
        title: step.title,
        text: step.text,
        gesture: step.gesture,
        published: true,
      },
      create: {
        stepIndex: step.stepIndex,
        part: step.part,
        partEn: step.partEn,
        title: step.title,
        text: step.text,
        gesture: step.gesture,
        published: true,
      },
    });
    upserted += 1;
  }
  return upserted;
}

async function main() {
  const count = await seedMassOrderSteps();
  console.log(`Mass order steps: ${count} upserted.`);
}

const isCli = process.argv[1]?.includes("seed-mass-order-steps");
if (isCli) {
  main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
