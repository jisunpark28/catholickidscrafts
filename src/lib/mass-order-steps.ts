import { prisma } from "@/lib/prisma";

export type MassOrderStepItem = {
  stepIndex: number;
  part: string;
  partEn: string;
  title: string;
  text: string;
  gesture: string;
};

export const MASS_ORDER_GESTURES = [
  "idle",
  "signCross",
  "pray",
  "ourFather",
  "point",
  "hold",
  "lift",
] as const;

export function isValidMassGesture(gesture: string): boolean {
  return (MASS_ORDER_GESTURES as readonly string[]).includes(gesture);
}

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
