import Link from "next/link";

const navLinks = [
  { href: "/#curriculum", label: "Curriculum" },
  { href: "/resources", label: "Resources" },
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#1a1921]/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-[#1a1921]/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            ✝
          </span>
          <span className="text-xl font-bold uppercase tracking-tight text-[#dfb24f]">
            Catholic Kids Crafts
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden transition hover:text-[#dfb24f] sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/resources"
            className="rounded bg-[#dfb24f] px-4 py-2 font-semibold text-[#131217] transition hover:bg-[#ebd07f]"
          >
            Free Resources
          </Link>
        </div>
      </div>
    </nav>
  );
}
