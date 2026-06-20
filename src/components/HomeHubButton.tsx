"use client";

import { HUB_PILL_STYLE } from "@/lib/hub-pill-style";
import { normalizeHubHref } from "@/lib/hub-href";

type BaseProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

const shell =
  "relative z-30 items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 min-h-[3.25rem] text-center text-base font-semibold tracking-tight transition duration-200 touch-manipulation sm:min-h-[3.5rem] sm:text-lg";

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

/** Unified home hub pill — same size as Daily Mass on every page (header excluded). */
export function HomeHubButtonLink({
  href,
  children,
  variant = "outline",
  className = "",
}: LinkProps) {
  const safeHref = normalizeHubHref(href);

  return (
    <a
      href={safeHref}
      style={HUB_PILL_STYLE}
      className={`cursor-pointer no-underline ${classes(variant, className)}`}
    >
      {children}
    </a>
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
      style={HUB_PILL_STYLE}
      className={classes(variant, className)}
    >
      {children}
    </button>
  );
}

/** Header account control — not hub pill width. */
export function HomeHubMenuButton({
  children,
  onClick,
  ariaExpanded,
  ariaControls,
  authLabel = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
  authLabel?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-3 min-h-[2.75rem] shadow-sm transition hover:border-[#d9cfc3] hover:bg-white sm:min-h-[3rem] sm:px-6 ${
        authLabel
          ? "text-sm font-semibold normal-case tracking-normal text-[var(--color-ink)]"
          : "text-xs font-bold uppercase tracking-widest text-[var(--color-ink)] sm:text-sm"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** @deprecated Use HUB_PILL_CONTAINER_STYLE via HubPillWidth or inline style */
export const HOME_HUB_DAILY_MASS_WIDTH_CLASS = "ckc-hub-pill-width";
export const HOME_HUB_SECTIONS_WIDTH_CLASS = HOME_HUB_DAILY_MASS_WIDTH_CLASS;
export const HOME_HUB_TYPING_WIDTH_CLASS = HOME_HUB_DAILY_MASS_WIDTH_CLASS;
export const HOME_HUB_NARROW_CONTENT_CLASS = HOME_HUB_DAILY_MASS_WIDTH_CLASS;
export const HOME_HUB_CONTENT_CLASS = HOME_HUB_DAILY_MASS_WIDTH_CLASS;

export const HOME_HUB_PANEL_CLASS =
  "rounded-2xl border border-[#e8e0d6] bg-[#fdfaf7] px-5 py-4 text-sm leading-relaxed text-[var(--color-muted)]";
