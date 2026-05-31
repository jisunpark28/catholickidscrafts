type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <header className="mb-10 border-b border-[var(--color-border)] pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
