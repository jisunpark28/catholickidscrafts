import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/admin-roles";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const superAdmin = isSuperAdmin(session);

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {session?.user && (
        <header className="border-b border-[var(--color-border)] bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <Link href="/admin" className="hover:text-[var(--color-accent)]">
                Dashboard
              </Link>
              <Link href="/admin/resources" className="hover:text-[var(--color-accent)]">
                Resources
              </Link>
              <Link href="/admin/curriculum" className="hover:text-[var(--color-accent)]">
                Curriculum
              </Link>
              <Link href="/admin/church-decorations" className="hover:text-[var(--color-accent)]">
                Church game
              </Link>
              <Link href="/admin/typing-words" className="hover:text-[var(--color-accent)]">
                Typing words
              </Link>
              <Link href="/admin/photo-booth-frames" className="hover:text-[var(--color-accent)]">
                Photo booth
              </Link>
              <Link href="/admin/recommendations" className="hover:text-[var(--color-accent)]">
                Recommendations
              </Link>
              {superAdmin && (
                <Link href="/admin/operators" className="hover:text-[var(--color-accent)]">
                  Operators
                </Link>
              )}
              <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                View site
              </Link>
            </div>
            <p className="text-xs text-[var(--color-muted)]">{session.user.email}</p>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
