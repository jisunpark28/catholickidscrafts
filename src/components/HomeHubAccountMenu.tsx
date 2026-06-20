"use client";

import { HomeHubMenuButton } from "@/components/HomeHubButton";
import {
  headerButtonLabel,
  isHeaderSignedIn,
  type HeaderSessionResponse,
} from "@/lib/header-session";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type MenuLinkProps = {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
};

function MenuLink({ href, children, onNavigate }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block rounded-lg px-2 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[#fdfaf7] hover:text-[var(--color-accent)]"
    >
      {children}
    </Link>
  );
}

type MenuButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function MenuButton({ children, onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      suppressHydrationWarning
      className="block w-full rounded-lg px-2 py-2 text-right text-sm font-medium text-[var(--color-ink)] transition hover:bg-[#fdfaf7] hover:text-[var(--color-accent)]"
    >
      {children}
    </button>
  );
}

type Props = {
  siteNav: { href: string; label: string }[];
  initialSession: HeaderSessionResponse;
};

export function HomeHubAccountMenu({ siteNav, initialSession }: Props) {
  const pathname = usePathname() ?? "";
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<HeaderSessionResponse>(initialSession);

  const signedIn = isHeaderSignedIn(session);
  const label = headerButtonLabel(session);

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) {
        setSession({ family: null, reader: null });
        return;
      }
      const data = (await res.json()) as HeaderSessionResponse;
      setSession(data);
    } catch {
      setSession({ family: null, reader: null });
    }
  }, []);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  useEffect(() => {
    void loadSession();
  }, [loadSession, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const close = () => setOpen(false);

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

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <HomeHubMenuButton
        onClick={() => setOpen((v) => !v)}
        ariaExpanded={open}
        authLabel
        className={signedIn ? "max-w-[10.5rem] truncate sm:max-w-[12rem]" : undefined}
        aria-controls={menuId}
      >
        {label}
      </HomeHubMenuButton>

      {open && (
        <nav
          id={menuId}
          aria-label="Account and site menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] min-w-[12rem] max-w-[18rem] rounded-2xl border border-[#e8e0d6] bg-white/95 py-2 pl-4 pr-3 shadow-lg backdrop-blur-sm"
        >
          <div className="text-right">
            {session.family && (
              <p className="px-2 pb-1 text-xs text-[var(--color-muted)]">{session.family.email}</p>
            )}
            {session.reader && !session.family && (
              <p className="px-2 pb-1 text-xs text-[var(--color-muted)]">
                {session.reader.type === "sub" ? "Reader" : "Parent reader"}
              </p>
            )}

            <ul className="flex flex-col items-end">
              {session.family && (
                <>
                  <li className="w-full">
                    <MenuLink href="/account" onNavigate={close}>
                      Account settings
                    </MenuLink>
                  </li>
                  <li className="w-full">
                    <MenuLink href="/reader/login" onNavigate={close}>
                      Switch reader
                    </MenuLink>
                  </li>
                  <li className="w-full">
                    <MenuButton onClick={() => void signOutFamily()}>Sign out</MenuButton>
                  </li>
                </>
              )}

              {!session.family && session.reader && (
                <>
                  <li className="w-full">
                    <MenuLink href="/reader/login" onNavigate={close}>
                      Switch reader
                    </MenuLink>
                  </li>
                  <li className="w-full">
                    <MenuLink href="/account/login" onNavigate={close}>
                      Family sign in
                    </MenuLink>
                  </li>
                  <li className="w-full">
                    <MenuButton onClick={() => void signOutReader()}>Sign out</MenuButton>
                  </li>
                </>
              )}

              {!signedIn && (
                <>
                  <li className="w-full">
                    <MenuLink href="/account/login" onNavigate={close}>
                      Family sign in
                    </MenuLink>
                  </li>
                  <li className="w-full">
                    <MenuLink href="/account/signup" onNavigate={close}>
                      Create family account
                    </MenuLink>
                  </li>
                  <li className="w-full">
                    <MenuLink href="/reader/login" onNavigate={close}>
                      Reader sign in
                    </MenuLink>
                  </li>
                </>
              )}
            </ul>

            <div className="my-2 border-t border-[#e8e0d6]" />

            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
              Browse
            </p>
            <ul className="flex flex-col items-end">
              {siteNav.map((item) => (
                <li key={item.href} className="w-full">
                  <MenuLink href={item.href} onNavigate={close}>
                    {item.label}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}
