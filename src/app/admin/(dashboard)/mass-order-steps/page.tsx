import { MassOrderStepsManager } from "@/components/admin/MassOrderStepsManager";
import { mergeMassOrderStepsForAdmin } from "@/lib/mass-order-defaults";
import { prisma } from "@/lib/prisma";

export default async function AdminMassOrderStepsPage() {
  let dbRows: Awaited<ReturnType<typeof prisma.massOrderStep.findMany>> = [];
  try {
    dbRows = await prisma.massOrderStep.findMany({
      orderBy: { stepIndex: "asc" },
    });
  } catch (e) {
    console.error("mass-order-steps admin:", e);
  }
  const steps = mergeMassOrderStepsForAdmin(dbRows);

  return (
    <div>
      <h1 className="text-2xl font-bold">Mass Order (Tiny Priest)</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {steps.length} steps — text shown in the sanctuary when players use Mass Order.
      </p>
      <div className="mt-6">
        <MassOrderStepsManager initialSteps={steps} />
      </div>
    </div>
  );
}
