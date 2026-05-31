import Link from "next/link";
import { MASS_DATA_SOURCE } from "@/lib/evangelizo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="font-bold text-slate-800">Catholic Kids Crafts</p>
            <p className="mt-2 text-sm text-slate-600">
              Daily Mass in English and catechism materials for families and
              Sunday school teachers.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Mass readings</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {MASS_DATA_SOURCE}. Readings are for personal and educational use;
              check your local parish for official liturgical books.
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Catholic Kids Crafts ·{" "}
          <Link href="/resources" className="hover:text-[#2563eb]">
            Lesson plans
          </Link>
        </p>
      </div>
    </footer>
  );
}
