import Image from "next/image";
import Link from "next/link";
import logo from "@/Logo.png";
import { MASS_DATA_SOURCE } from "@/lib/evangelizo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <Image
              src={logo}
              alt=""
              className="h-20 w-auto object-contain"
              style={{ height: "80px", width: "auto" }}
            />
            <div>
              <p className="font-bold text-[var(--color-ink)]">Catholic Kids Crafts</p>
              <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
                Daily Mass in English and seasonal resources for Catholic families
                and Sunday school.
              </p>
            </div>
          </div>
          <div className="flex gap-8 text-sm font-semibold">
            <Link href="/mass" className="text-[var(--color-link)] hover:underline">
              Daily Mass
            </Link>
            <Link href="/curriculum" className="text-[var(--color-link)] hover:underline">
              Curriculum
            </Link>
            <Link href="/resources" className="text-[var(--color-link)] hover:underline">
              Kids Resources
            </Link>
          </div>
        </div>
        <p className="mt-10 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted)]">
          {MASS_DATA_SOURCE} · © {new Date().getFullYear()} Catholic Kids Crafts
        </p>
      </div>
    </footer>
  );
}
