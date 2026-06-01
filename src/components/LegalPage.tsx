import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function LegalPage({ title, subtitle, children }: Props) {
  return (
    <PageShell>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="prose-legal mt-8 max-w-3xl space-y-4 text-[var(--color-ink)] leading-relaxed">
        {children}
      </div>
    </PageShell>
  );
}
