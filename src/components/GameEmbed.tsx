import Link from "next/link";

type Props = {
  title: string;
  src: string;
  description?: string;
  /** Show mobile/desktop tip under the title (off for hangman, etc.). */
  showTip?: boolean;
};

export function GameEmbed({ title, src, description, showTip = true }: Props) {
  return (
    <div>
      <Link
        href="/play"
        className="text-sm font-semibold text-[var(--color-link)] hover:underline"
      >
        ← Play & learn
      </Link>
      <header className="mt-6 border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
        ) : null}
        {showTip ? (
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Tip: use fullscreen on mobile for the best experience. Keyboard games work best on a
            desktop.
          </p>
        ) : null}
      </header>
      <div className="mt-4 border border-[var(--color-border)] bg-black">
        <iframe
          title={title}
          src={src}
          className="h-[min(80vh,720px)] w-full bg-white"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
