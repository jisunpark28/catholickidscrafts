import { prisma } from "@/lib/prisma";

export type MassOrderStepItem = {
  stepIndex: number;
  part: string;
  partEn: string;
  title: string;
  text: string;
  gesture: string;
};

export { MASS_ORDER_GESTURES, isValidMassGesture } from "@/lib/mass-order-gestures";

function mapRow(r: {
  stepIndex: number;
  part: string;
  partEn: string;
  title: string;
  text: string;
  gesture: string;
}): MassOrderStepItem {
  return {
    stepIndex: r.stepIndex,
    part: r.part.trim(),
    partEn: r.partEn.trim(),
    title: r.title.trim(),
    text: r.text.trim(),
    gesture: r.gesture.trim() || "idle",
  };
}

export async function getPublishedMassOrderSteps(): Promise<MassOrderStepItem[]> {
  const rows = await prisma.massOrderStep.findMany({
    where: { published: true },
    orderBy: { stepIndex: "asc" },
  });
  return rows.map(mapRow).filter((s) => s.title.length > 0 && s.text.length > 0);
}
