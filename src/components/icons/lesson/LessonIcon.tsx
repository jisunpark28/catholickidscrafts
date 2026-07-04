import type { LessonBlockType } from "@prisma/client";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SvgClipboard({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <rect x="7" y="4" width="10" height="16" rx="1.5" {...stroke} />
      <path d="M9 4.5h6a1 1 0 0 1 1 1v1.5H8V5.5a1 1 0 0 1 1-1z" {...stroke} />
      <path d="M9 11h6M9 14h4" {...stroke} />
    </svg>
  );
}

function SvgPuzzle({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path
        d="M8 4h3a2 2 0 0 1 2 2 2 2 0 0 0 2 2h3v3a2 2 0 0 1-2 2 2 2 0 0 0-2 2v3h-3a2 2 0 0 1-2-2 2 2 0 0 0-2-2H4v-3a2 2 0 0 1 2-2 2 2 0 0 0 2-2V4z"
        {...stroke}
      />
    </svg>
  );
}

function SvgKeyboard({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <rect x="3" y="7" width="18" height="10" rx="2" {...stroke} />
      <path d="M7 11h.01M11 11h.01M15 11h.01M7 14h10" {...stroke} />
    </svg>
  );
}

function SvgCross({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M12 5v14M7 10h10" {...stroke} />
    </svg>
  );
}

function SvgBookOpen({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H12v16H6.5A2.5 2.5 0 0 1 4 17.5V6.5z" {...stroke} />
      <path d="M20 6.5A2.5 2.5 0 0 0 17.5 4H12v16h5.5A2.5 2.5 0 0 0 20 17.5V6.5z" {...stroke} />
    </svg>
  );
}

function SvgScissors({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <circle cx="6" cy="7" r="2.25" {...stroke} />
      <circle cx="6" cy="17" r="2.25" {...stroke} />
      <path d="M8.2 8.7 18 14M8.2 15.3 18 10" {...stroke} />
    </svg>
  );
}

function SvgCalendar({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <rect x="4" y="5" width="16" height="15" rx="2" {...stroke} />
      <path d="M8 3v4M16 3v4M4 10h16" {...stroke} />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SvgHangman({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M6 20V4M6 4h8M10 4v3" {...stroke} />
      <circle cx="10" cy="9" r="1.75" {...stroke} />
      <path d="M10 11v4M8.5 13h3" {...stroke} />
    </svg>
  );
}

function SvgBuilding({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M5 20V8l7-4 7 4v12" {...stroke} />
      <path d="M9 20v-5h6v5M9 11h.01M12 11h.01M15 11h.01" {...stroke} />
    </svg>
  );
}

function SvgHome({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M4 11 12 5l8 6v8a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-8z" {...stroke} />
    </svg>
  );
}

function SvgImage({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <rect x="4" y="5" width="16" height="14" rx="2" {...stroke} />
      <circle cx="9" cy="10" r="1.5" {...stroke} />
      <path d="m4 16 5-5 4 4 3-3 4 4" {...stroke} />
    </svg>
  );
}

function SvgPencil({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M4 20h4l9.5-9.5a2.1 2.1 0 0 0-3-3L5 17v3z" {...stroke} />
      <path d="m13.5 6.5 3 3" {...stroke} />
    </svg>
  );
}

function SvgLink({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M10 13a4.5 4.5 0 0 0 6.36 0l2.12-2.12a4.5 4.5 0 0 0-6.36-6.36L11 5.5" {...stroke} />
      <path d="M14 11a4.5 4.5 0 0 0-6.36 0L5.52 13.12a4.5 4.5 0 0 0 6.36 6.36L13 18.5" {...stroke} />
    </svg>
  );
}

function SvgGrip({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M9 6h2M9 12h2M9 18h2M13 6h2M13 12h2M13 18h2" {...stroke} />
    </svg>
  );
}

function SvgTrash({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" {...stroke} />
    </svg>
  );
}

function SvgCheck({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...rest}>
      <path d="M6 12.5 10 16.5 18 8" {...stroke} />
    </svg>
  );
}

const BLOCK_ICONS: Record<LessonBlockType, typeof SvgPuzzle> = {
  CUSTOM_NOTE: SvgClipboard,
  WRITING: SvgPencil,
  RESOURCE: SvgScissors,
  LINK: SvgLink,
  IMAGE: SvgImage,
  PLAY_GAME: SvgPuzzle,
  TYPING_WORDS: SvgKeyboard,
  HANGMAN_WORDS: SvgHangman,
  GOSPEL_TYPING: SvgCross,
  BIBLE_CHAPTER: SvgBookOpen,
  MASS_TODAY: SvgCalendar,
};

export type LessonIconName =
  | LessonBlockType
  | "building"
  | "home"
  | "grip"
  | "trash"
  | "check";

type Props = {
  name: LessonIconName;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "lesson-icon lesson-icon--sm",
  md: "lesson-icon",
  lg: "lesson-icon lesson-icon--lg",
};

export function LessonIcon({ name, active = false, size = "md", className = "" }: Props) {
  const Icon =
    name === "building"
      ? SvgBuilding
      : name === "home"
        ? SvgHome
        : name === "grip"
          ? SvgGrip
          : name === "trash"
            ? SvgTrash
            : name === "check"
              ? SvgCheck
              : BLOCK_ICONS[name];

  return (
    <Icon
      className={`${SIZE_CLASS[size]}${active ? " lesson-icon--active" : ""}${className ? ` ${className}` : ""}`}
    />
  );
}

export function LessonBlockIcon({
  type,
  active,
  size = "md",
}: {
  type: LessonBlockType;
  active?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return <LessonIcon name={type} active={active} size={size} />;
}
