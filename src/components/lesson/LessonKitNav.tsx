import Link from "next/link";
import { LESSON_KIT_PRODUCT_NAME_PLURAL } from "@/lib/lesson-kit/branding";

export type LessonKitNavItem = {
  href?: string;
  label: string;
};

type Props = {
  items: LessonKitNavItem[];
  className?: string;
};

export function LessonKitNav({ items, className = "" }: Props) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Lesson kit navigation" className={`lesson-kit-nav ${className}`}>
      <ol className="lesson-kit-nav__list">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="lesson-kit-nav__item">
            {index > 0 ? (
              <span className="lesson-kit-nav__sep" aria-hidden>
                /
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href} className="lesson-kit-nav__link">
                {item.label}
              </Link>
            ) : (
              <span className="lesson-kit-nav__current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function teacherProgramNavItems(): LessonKitNavItem[] {
  return [
    { href: "/", label: "Home" },
    { label: LESSON_KIT_PRODUCT_NAME_PLURAL },
  ];
}

export function teacherTemplatesNavItems(): LessonKitNavItem[] {
  return [
    { href: "/", label: "Home" },
    { href: "/program", label: LESSON_KIT_PRODUCT_NAME_PLURAL },
    { label: "Templates" },
  ];
}

export function teacherCommunityNavItems(): LessonKitNavItem[] {
  return [
    { href: "/", label: "Home" },
    { href: "/program", label: LESSON_KIT_PRODUCT_NAME_PLURAL },
    { label: "Community" },
  ];
}

export function teacherEditNavItems(): LessonKitNavItem[] {
  return [
    { href: "/", label: "Home" },
    { href: "/program", label: LESSON_KIT_PRODUCT_NAME_PLURAL },
    { label: "Edit kit" },
  ];
}

export function teacherPrintNavItems(kitId: string): LessonKitNavItem[] {
  return [
    { href: "/", label: "Home" },
    { href: "/program", label: LESSON_KIT_PRODUCT_NAME_PLURAL },
    { href: `/program/kit/${kitId}`, label: "Edit kit" },
    { label: "Print" },
  ];
}

export function adminTemplatesNavItems(): LessonKitNavItem[] {
  return [
    { href: "/admin", label: "Admin" },
    { href: "/", label: "Home" },
    { label: "Lesson templates" },
  ];
}

export function adminTemplateEditNavItems(): LessonKitNavItem[] {
  return [
    { href: "/admin", label: "Admin" },
    { href: "/admin/lesson-templates", label: "Lesson templates" },
    { label: "Edit" },
  ];
}
