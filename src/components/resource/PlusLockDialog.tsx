"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export const PLUS_LOCK_LINE = "This is a Plus resource. This Sunday's sheet, card and bundle are free.";

/** The always-free This Sunday tab, keeping the Level 2 choice. */
export function freeResourcesHref(level: 1 | 2 = 1): string {
  return level === 2 ? "/resource?level=2" : "/resource";
}

const primaryBtn =
  "inline-flex w-full items-center justify-center rounded-full bg-[#d35400] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-[#b8470a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";
const secondaryBtn =
  "inline-flex w-full items-center justify-center rounded-full border-2 border-[#d35400] bg-white px-5 py-2 text-sm font-semibold text-[#d35400] no-underline transition hover:bg-[#fff6ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d35400]";

type DialogProps = {
  open: boolean;
  /** Called after Esc, the X button or a backdrop click. */
  onClose: () => void;
  level?: 1 | 2;
};

/**
 * Small confirm-style popup for free visitors who hit a Plus-locked action.
 * Native <dialog> + showModal(): the page behind is inert (focus stays inside), Esc closes,
 * and focus returns to the button that opened it. Display only; access is enforced on the server.
 */
export function PlusLockDialog({ open, onClose, level = 1 }: DialogProps) {
  if (!open) return null;
  return <OpenDialog onClose={onClose} level={level} />;
}

function OpenDialog({ onClose, level }: { onClose: () => void; level: 1 | 2 }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleClose = () => closeRef.current();
    d.addEventListener("close", handleClose);
    if (!d.open) d.showModal();
    // Start on the main action (showModal would otherwise focus the X).
    d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      d.removeEventListener("close", handleClose);
      if (d.open) d.close();
      returnTo?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-modal="true"
      onKeyDown={(e) => {
        // Keep Tab inside the popup (it would otherwise reach the browser's address bar).
        if (e.key !== "Tab") return;
        const items = [...(ref.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [])];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
      onClick={(e) => {
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-auto w-[min(92vw,22rem)] overflow-visible rounded-2xl border border-[#e8e0d6] bg-white p-0 text-[#1c1c1c] shadow-[0_20px_50px_rgba(28,28,28,0.25)] backdrop:bg-[rgba(28,28,28,0.45)]"
    >
      <div className="relative px-5 pb-5 pt-7 text-center">
        <button
          type="button"
          aria-label="Close"
          onClick={() => ref.current?.close()}
          className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-[#6b7280] transition hover:bg-[#f3f1ee] hover:text-[#1c1c1c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d35400]"
        >
          <span aria-hidden>{"\u00d7"}</span>
        </button>
        <h2 id={titleId} className="m-0 px-3 text-[15px] font-semibold leading-snug">
          {PLUS_LOCK_LINE}
        </h2>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={freeResourcesHref(level)} data-autofocus className={primaryBtn}>
            Get this week&apos;s free resources
          </Link>
          <Link href="/subscribe" className={secondaryBtn}>
            Unlock with Plus
          </Link>
        </div>
      </div>
    </dialog>
  );
}

type ButtonProps = {
  className: string;
  level?: 1 | 2;
  title?: string;
  children: React.ReactNode;
};

/** A locked button (keeps its locked look) that opens the Plus popup instead of doing nothing. */
export function PlusLockButton({ className, level = 1, title, children }: ButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" aria-haspopup="dialog" title={title} className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <PlusLockDialog open={open} onClose={() => setOpen(false)} level={level} />
    </>
  );
}

/** Locked print pages: the popup opens right away; closing it goes back to the resource. */
export function PlusLockOnLoad({ level = 1, backHref }: { level?: 1 | 2; backHref: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  return (
    <>
      <PlusLockDialog
        open={open}
        level={level}
        onClose={() => {
          setOpen(false);
          router.push(backHref);
        }}
      />
      <noscript>
        <p className="mx-auto max-w-md px-6 py-16 text-center text-sm text-[#4b5563]">
          {PLUS_LOCK_LINE}{" "}
          <a href={freeResourcesHref(level)} className="font-semibold text-[#d35400]">
            Get this week&apos;s free resources
          </a>{" "}
          {"\u00b7"}{" "}
          <a href="/subscribe" className="font-semibold text-[#d35400]">
            Unlock with Plus
          </a>
        </p>
      </noscript>
    </>
  );
}