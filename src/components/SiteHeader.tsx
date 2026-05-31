import Link from "next/link";

const navLinks = [
  { href: "/", label: "Daily Mass" },
  { href: "/resources", label: "Kids Resources" },
  { href: "/#curriculum", label: "Curriculum" },
];

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563eb] text-lg text-white shadow-sm">
            ✝
          </span>
          <span className="text-lg font-extrabold text-slate-800">
            Catholic Kids Crafts
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden transition hover:text-[#2563eb] sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/resources"
            className="rounded-lg bg-[#2563eb] px-3 py-2 text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            Resources
          </Link>
        </div>
      </div>
    </nav>
  );
}
