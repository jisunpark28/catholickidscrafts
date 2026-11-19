type Props = {
  title: string;
  subtitle?: string;
  /** Short tip for catechists / program leaders (how to use this page in class). */
  programNote?: string;
  /** Small utility controls beside the title (e.g. Share to Classroom). */
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, programNote, actions, children }: Props) {
  return (
    <header className="mb-10 border-b border-[var(--color-border)] pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h1>
        {actions}
      </div>
      {subtitle && (
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
          {subtitle}
        </p>
      )}
      {programNote && (
        <p className="mt-4 max-w-3xl border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-muted)]">
          {programNote}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
