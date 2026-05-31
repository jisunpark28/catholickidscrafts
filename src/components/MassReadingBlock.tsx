import type { MassReading } from "@/types/mass";

type Props = { reading: MassReading };

export function MassReadingBlock({ reading }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
        {reading.label}
      </p>
      {reading.title && (
        <h3 className="mt-2 text-lg font-bold text-slate-800">{reading.title}</h3>
      )}
      <div className="prose-mass mt-4 whitespace-pre-wrap text-slate-700">
        {reading.text}
      </div>
    </section>
  );
}
