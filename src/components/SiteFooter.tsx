import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-800 bg-[#1a1921] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-bold text-[#dfb24f]">Catholic Kids Crafts</p>
            <p className="mt-2 text-sm text-gray-400">
              Free catechism materials for Sunday school teachers, homeschool
              parents, and parishes worldwide.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#7c6a85]">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/#curriculum" className="hover:text-[#dfb24f]">
                  Curriculum
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#dfb24f]">
                  All resources
                </Link>
              </li>
            </ul>
          </div>
          <div id="about">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#7c6a85]">
              About
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Built for the global Catholic education community. Deploy on{" "}
              <span className="text-[#fcfaf2]">Vercel</span> with content in{" "}
              <span className="text-[#fcfaf2]">GitHub</span>—add Markdown files
              to publish new lesson plans.
            </p>
          </div>
        </div>
        <p className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Catholic Kids Crafts. For educational use.
        </p>
      </div>
    </footer>
  );
}
