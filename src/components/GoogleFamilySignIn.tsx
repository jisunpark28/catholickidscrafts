type Props = {
  enabled?: boolean;
  from?: "signup" | "login";
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-5.514 0-10.08-3.72-11.613-8.803H2.388v7.238C5.386 41.798 14.179 46 24 46c12.703 0 23-10.297 23-23 0-.76-.034-1.5-.102-2.217z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 29.083 4 24 4 14.179 4 5.386 8.202 2.388 16.758l3.918 6.933z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C5.454 39.556 14.179 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-.76-.034-1.5-.102-2.217z"
      />
    </svg>
  );
}

export function GoogleFamilySignIn({ enabled = false, from = "login" }: Props) {
  if (!enabled) return null;

  const href = from === "signup" ? "/api/auth/family/google?from=signup" : "/api/auth/family/google";

  return (
    <>
      {/* Full page navigation — Next.js Link breaks OAuth redirects on /api routes */}
      <a
        href={href}
        className="relative z-10 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-white py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]"
      >
        <GoogleMark />
        Continue with Google
      </a>
      <div className="relative flex items-center py-4">
        <div className="grow border-t border-[var(--color-border)]" />
        <span className="mx-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          or use email
        </span>
        <div className="grow border-t border-[var(--color-border)]" />
      </div>
    </>
  );
}
