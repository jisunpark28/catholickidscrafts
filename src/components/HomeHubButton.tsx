"use client";

import Link from "next/link";
import { normalizeHubHref } from "@/lib/hub-href";

type BaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

const shell =
  "flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 min-h-[3.25rem] text-center text-base font-semibold tracking-tight transition duration-200 touch-manipulation sm:min-h-[3.5rem] sm:text-lg";

const variants = {
  primary:
    "border-[#dfc9b0] bg-[#f5d4b8] text-[var(--color-ink)] shadow-sm hover:border-[#d4b896] hover:bg-[#f0c9a8] hover:shadow",
  outline:
    "border-[#e8e0d6] bg-white text-[var(--color-ink)] shadow-sm hover:border-[#d9cfc3] hover:bg-[#fdfaf7]",
} as const;

function classes(variant: keyof typeof variants, className: string) {
  return `${shell} ${variants[variant]} ${className}`.trim();
}

type LinkProps = BaseProps & {
  href: string;
};

type ButtonProps = BaseProps & {
  type?: "button";
  onClick?: () => void;
  "aria-expanded"?: boolean;
};

/** Unified home hub pill — Daily Mass and section links share the same size. */
export function HomeHubButtonLink({
  href,
  children,
  variant = "outline",
  className = "",
}: LinkProps) {
  const safeHref = normalizeHubHref(href);

  return (
    <Link
      href={safeHref}
      prefetch
      className={`relative z-20 block cursor-pointer ${classes(variant, className)}`}
    >
      {children}
    </Link>
  );
}

export function HomeHubButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  "aria-expanded": ariaExpanded,
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      className={classes(variant, className)}
    >
      {children}
    </button>
  );
}

/** Header MENU control — matches hub button height rhythm. */
export function HomeHubMenuButton({
  children,
  onClick,
  ariaExpanded,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaExpanded?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-3 min-h-[2.75rem] text-xs font-bold uppercase tracking-widest text-[var(--color-ink)] shadow-sm transition hover:border-[#d9cfc3] hover:bg-white sm:min-h-[3rem] sm:px-6 sm:text-sm ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Home hub widths (fixed rem — do not use ad-hoc max-w-* elsewhere).
 * Section pills are always exactly 2× Daily Mass.
 */
export const HOME_HUB_DAILY_MASS_WIDTH_CLASS = "mx-auto w-full max-w-[20rem]";
export const HOME_HUB_SECTIONS_WIDTH_CLASS = "mx-auto w-full max-w-[40rem]";

/** Sub-page panels (gospel typing, notices) — same as section pill row. */
export const HOME_HUB_CONTENT_CLASS = HOME_HUB_SECTIONS_WIDTH_CLASS;

/** Inset panel styling aligned with hub pill borders. */
export const HOME_HUB_PANEL_CLASS =
  "rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm leading-relaxed text-[var(--color-muted)]";
