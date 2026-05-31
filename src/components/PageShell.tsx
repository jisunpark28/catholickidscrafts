type Props = {
  children: React.ReactNode;
  className?: string;
  /** Use full-bleed width (no max-width cap) */
  wide?: boolean;
};

export function PageShell({ children, className = "", wide = false }: Props) {
  return (
    <div
      className={`mx-auto w-full px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 ${
        wide ? "max-w-[1600px]" : "max-w-6xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}
