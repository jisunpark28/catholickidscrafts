"use client";

import { LessonIcon } from "@/components/icons/lesson/LessonIcon";

type Props = {
  total: number;
  current: number;
};

export function LessonProgressBar({ total, current }: Props) {
  if (total <= 0) return null;

  const items: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const done = i < current;
    const active = i === current;
    items.push(
      <span
        key={`dot-${i}`}
        className={`lesson-progress__dot${done ? " lesson-progress__dot--done" : ""}${active ? " lesson-progress__dot--active" : ""}`}
      />,
    );
    if (i < total - 1) {
      items.push(
        <span
          key={`bar-${i}`}
          className={`lesson-progress__bar${i < current ? " lesson-progress__bar--done" : ""}`}
        />,
      );
    }
  }

  return (
    <div className="lesson-progress" aria-label={`Step ${current + 1} of ${total}`}>
      {items}
      <span className="ml-2 text-xs font-semibold text-[var(--color-muted)]">
        {current + 1} / {total}
      </span>
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function LessonBigButton({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`lesson-big-button${variant === "secondary" ? " lesson-big-button--secondary" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

type TitleProps = {
  blockType: import("@prisma/client").LessonBlockType;
  label: string;
  active?: boolean;
};

export function LessonStepTitle({ blockType, label, active = true }: TitleProps) {
  return (
    <h2 className="lesson-step-title">
      <LessonIcon name={blockType} active={active} size="md" />
      <span>{label}</span>
    </h2>
  );
}
