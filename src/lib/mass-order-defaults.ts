import { MASS_ORDER_STEPS } from "../../prisma/data/mass-order-steps";
import type { MassOrderStepRow } from "@/components/admin/MassOrderStepsManager";

type DbRow = {
  id: string;
  stepIndex: number;
  part: string;
  partEn: string;
  title: string;
  text: string;
  gesture: string;
  published: boolean;
};

/** Merge DB rows with built-in defaults so admin always shows all 24 steps. */
export function mergeMassOrderStepsForAdmin(dbRows: DbRow[]): MassOrderStepRow[] {
  const byIndex = new Map(dbRows.map((r) => [r.stepIndex, r]));

  return MASS_ORDER_STEPS.map((def) => {
    const row = byIndex.get(def.stepIndex);
    if (row) {
      return {
        id: row.id,
        stepIndex: row.stepIndex,
        part: row.part,
        partEn: row.partEn,
        title: row.title,
        text: row.text,
        gesture: row.gesture,
        published: row.published,
      };
    }
    return {
      stepIndex: def.stepIndex,
      part: def.part,
      partEn: def.partEn,
      title: def.title,
      text: def.text,
      gesture: def.gesture,
      published: true,
    };
  });
}
