"use client";

import { HomeHubMenuButton, HomeHubMenuLink } from "@/components/HomeHubButton";
import {
  avatarInitial,
  firstName,
  headerButtonLabel,
  isHeaderSignedIn,
  type HeaderSessionResponse,
} from "@/lib/header-session";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ── Icons (simple inline line SVGs) ─────────────────────────────── */

type IconName = "memo" | "home" | "card" | "logout" | "swap" | "back" | "lock" | "check" | "chevron";

function Icon({ name, className = "h-[18px] w-[18px]" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "memo":
      return (
        <svg {...common}>
          <path d="M5 4h10l4 4v12H5z" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-6 8 6" />
          <path d="M6 10v9h12v-9" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M14 5h5v14h-5" />
          <path d="M10 8l-4 4 4 4M6 12h9" />
        </svg>
      );
    case "swap":
      return (
        <svg {...common}>
          <path d="M7 7h12l-3-3M17 17H5l3 3" />
        </svg>
      );
    case "back":
      return (
        <svg {...common}>
          <path d="M10 6l-6 6 6 6M4 12h16" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 018 0v3" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12l5 5 9-10" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
  }
}

function Avatar({ name, child, size = "sm" }: { name: string; child?: boolean; size?: "sm" | "md" }) {
  const dims = size === "md" ? "h-10 w-10 text-base" : "h-7 w-7 text-sm";
  const tone = child ? "bg-[#d6ebf7] text-[#2d5f7c]" : "bg-[#f5d4b8] text-[var(--color-ink)]";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${dims} ${tone}`}
    >
      {avatarInitial(name)}
    </span>
  );
}

/* ── Menu rows ───────────────────────────────────────────────────── */

const rowBase =
  "flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] font-medium transition hover:bg-[#f7efe6] focus-visible:bg-[#f7efe6] focus-visible:outline-none";
const rowInk = `${rowBase} text-[var(--color-ink)]`;
const rowDanger = `${rowBase} text-[#b4534a]`;

function Divider() {
  return <div role="separator" className="my-1.5 h-px bg-[#efe6da]" />;
}

/* ── Main ────────────────────────────────────────────────────────── */

type Props = {
  initialSession: HeaderSessionResponse;
  signInLabel: string;
};

type Mode = "parent" | "parent-child" | "child";

export function HomeHubAccountMenu({ initialSession, signInLabel }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const menuId = useId();
  const dialogTitleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<HeaderSessionResponse>(initialSession);

  const signedIn = isHeaderSignedIn(session);
  const family = session.family;
  const reader = session.reader;
  const mode: Mode = family ? (reader?.type === "sub" ? "parent-child" : "parent") : "child";

  const parentName = family ? headerButtonLabel({ family, reader: null }) : "";
  const familyLabel = family?.displayName?.trim() || "your family";
  const readerName =
    mode === "parent" ? parentName : (reader?.displayName ?? headerButtonLabel(session));
  const isChildReader = mode !== "parent";

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) {
        setSession({ family: null, reader: null });
        return;
      }
      setSession((await res.json()) as HeaderSessionResponse);
    } catch {
      setSession({ family: null, reader: null });
    }
  }, []);

  useEffect(() => setSession(initialSession), [initialSession]);
  useEffect(() => {
    void loadSession();
  }, [loadSession, pathname]);
  useEffect(() => {
    setOpen(false);
    setConfirmOpen(false);
  }, [pathname]);

  const focusButton = () =>
    buttonWrapRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

  const close = useCallback(() => setOpen(false), []);

  // Outside click closes the menu (not while the confirm dialog is up).
  useEffect(() => {
    if (!open || confirmOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, confirmOpen]);

  // Focus first item when the menu opens.
  useEffect(() => {
    if (open && !confirmOpen) {
      menuRef.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
    }
  }, [open, confirmOpen]);

  // Focus the dialog's first button when it opens.
  useEffect(() => {
    if (confirmOpen) dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [confirmOpen]);

  function menuItems(): HTMLElement[] {
    return Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [],
    );
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const items = menuItems();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      focusButton();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      close();
    }
  }

  function onDialogKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setConfirmOpen(false);
      return;
    }
    if (e.key !== "Tab") return;
    const btns = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    if (btns.length === 0) return;
    const first = btns[0];
    const last = btns[btns.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function signOutFamily() {
    await fetch("/api/auth/family/logout", { method: "POST" });
    close();
    window.location.href = "/";
  }

  async function signOutReader() {
    await fetch("/api/auth/reader/logout", { method: "POST" });
    close();
    window.location.reload();
  }

  /** Existing mechanism: parent reads as themselves (owner reader session). */
  async function switchToParent() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reader/as-owner", { method: "POST" });
      if (res.ok) {
        setConfirmOpen(false);
        close();
        window.location.reload();
        return;
      }
    } finally {
      setBusy(false);
    }
    setConfirmOpen(false);
  }

  /** Existing switch-reader flow: children sign in with their Access ID. */
  function switchToChild() {
    close();
    router.push("/reader/login");
  }

  if (!signedIn) {
    return (
      <HomeHubMenuLink href="/account/login" authLabel ariaLabel="Family account sign in">
        {signInLabel}
      </HomeHubMenuLink>
    );
  }

  const children = family?.children ?? [];
  const activeChildId = reader?.type === "sub" ? reader.subProfileId : undefined;

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <div ref={buttonWrapRef}>
        <HomeHubMenuButton
          onClick={() => setOpen((v) => !v)}
          ariaExpanded={open}
          ariaControls={menuId}
          authLabel
          className="max-w-[12rem] gap-2 !px-2.5 sm:max-w-[14rem] sm:!px-3"
        >
          <Avatar name={readerName} child={isChildReader} />
          <span className="truncate">{firstName(readerName)}</span>
          <Icon name="chevron" className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
        </HomeHubMenuButton>
      </div>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account menu"
          onKeyDown={onMenuKeyDown}
          className="fixed inset-x-3 top-[4.5rem] z-[60] rounded-xl border border-[#efe6da] bg-white p-2 shadow-[0_12px_32px_rgba(120,84,48,0.14)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+0.5rem)] sm:w-[18.5rem]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 pb-2 pt-2">
            <Avatar name={readerName} child={isChildReader} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-bold text-[var(--color-ink)]">{readerName}</p>
                {mode === "parent" && family?.isPlus && (
                  <span className="shrink-0 rounded-full bg-[#f5d4b8] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)]">
                    Plus
                  </span>
                )}
              </div>
              {mode === "parent" && family && (
                <p className="truncate text-[13px] text-[#6b625a]">{family.email}</p>
              )}
              {mode === "parent-child" && (
                <p className="truncate text-[13px] text-[#6b625a]">Reading with {familyLabel}</p>
              )}
            </div>
          </div>

          {/* Reading as */}
          {family && (
            <>
              <Divider />
              <p className="px-3 pb-1 pt-1 text-[12px] font-semibold uppercase tracking-wider text-[#8a7f74]">
                Reading as
              </p>
              <div role="group" aria-label="Reading as">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={mode === "parent"}
                  className={rowInk}
                  onClick={() => {
                    if (mode === "parent") return;
                    setConfirmOpen(true);
                  }}
                >
                  <Avatar name={parentName} />
                  <span className="flex-1 truncate">{firstName(parentName)}</span>
                  {mode === "parent" ? (
                    <Icon name="check" className="h-4 w-4 text-[var(--color-accent)]" />
                  ) : (
                    <Icon name="lock" className="h-4 w-4 text-[#8a7f74]" />
                  )}
                </button>
                {children.map((c) => {
                  const active = c.id === activeChildId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      className={rowInk}
                      onClick={() => {
                        if (!active) switchToChild();
                      }}
                    >
                      <Avatar name={c.displayName} child />
                      <span className="flex-1 truncate">{c.displayName}</span>
                      {active && <Icon name="check" className="h-4 w-4 text-[var(--color-accent)]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <Divider />

          {/* Items */}
          <Link href="/account/memos" role="menuitem" className={rowInk} onClick={close}>
            <Icon name="memo" />
            My memos
          </Link>
          {mode === "parent" && (
            <>
              <Link href="/account" role="menuitem" className={rowInk} onClick={close}>
                <Icon name="home" />
                Family account
              </Link>
              <Link href="/subscribe" role="menuitem" className={rowInk} onClick={close}>
                <Icon name="card" />
                Plus &amp; billing
              </Link>
            </>
          )}

          <Divider />

          {mode === "parent" && (
            <button
              type="button"
              role="menuitem"
              className={rowDanger}
              onClick={() => void signOutFamily()}
            >
              <Icon name="logout" />
              Sign out
            </button>
          )}
          {mode === "parent-child" && (
            <button
              type="button"
              role="menuitem"
              className={rowInk}
              onClick={() => setConfirmOpen(true)}
            >
              <Icon name="back" />
              Back to parent
            </button>
          )}
          {mode === "child" && (
            <>
              <Link href="/reader/login" role="menuitem" className={rowInk} onClick={close}>
                <Icon name="swap" />
                Switch reader
              </Link>
              <button
                type="button"
                role="menuitem"
                className={rowDanger}
                onClick={() => void signOutReader()}
              >
                <Icon name="logout" />
                Sign out
              </button>
            </>
          )}
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(60,40,20,0.35)] p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onKeyDown={onDialogKeyDown}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-[0_12px_32px_rgba(120,84,48,0.2)]"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f7efe6] text-[var(--color-ink)]">
                <Icon name="lock" />
              </span>
              <div>
                <p id={dialogTitleId} className="text-[17px] font-bold text-[var(--color-ink)]">
                  Switch to {firstName(parentName)}?
                </p>
                <p className="text-[14px] text-[#6b625a]">Grown-ups only</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="min-h-[40px] rounded-lg border border-[#e8e0d6] px-4 text-[15px] font-medium text-[var(--color-ink)] hover:bg-[#f7efe6]"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                className="min-h-[40px] rounded-lg bg-[#f5d4b8] px-4 text-[15px] font-semibold text-[var(--color-ink)] hover:bg-[#f0c9a8] disabled:opacity-60"
                onClick={() => void switchToParent()}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
