"use client";

import { MB_LIMITS, MB_ROLE_CHOICES } from "@/lib/moms-bible/constants";
import { useCallback, useEffect, useState } from "react";
import { InviteAcceptClient } from "./InviteAcceptClient";
import { mbFetch } from "./mb-fetch";
import "@/styles/moms-bible.css";

type Child = { id: string; displayName: string };
type InviteRow = { id: string; roleLabel: string; subProfileIds: string[]; expiresAt: string };
type LinkRow = { id: string; roleLabel: string; email: string; childName: string };

type Props = {
  roleLabel: string;
  emailMode: "INSTANT" | "DIGEST" | "OFF";
  ownChildren: Child[];
  /** Children of other families this parent is linked to (co-parent links). */
  joined: { linkId: string; childName: string }[];
};

/** /account: Mom's Bible settings, invite a co-parent (e.g. Dad), and linked parents. */
export function MomsBibleAccountSection({ roleLabel, emailMode, ownChildren, joined: initialJoined }: Props) {
  const [label, setLabel] = useState(roleLabel);
  const [mode, setMode] = useState(emailMode);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteKids, setInviteKids] = useState<string[]>(ownChildren.map((c) => c.id));
  const [inviteRole, setInviteRole] = useState("Dad");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [joined, setJoined] = useState(initialJoined);
  const [busy, setBusy] = useState(false);

  const loadInvites = useCallback(async () => {
    const res = await mbFetch<{ invites: InviteRow[]; links: LinkRow[] }>("/api/moms-bible/invites");
    if (res.ok) {
      setInvites(res.data.invites);
      setLinks(res.data.links);
    }
  }, []);

  useEffect(() => {
    if (ownChildren.length) void loadInvites();
  }, [ownChildren.length, loadInvites]);

  async function save(body: Record<string, string>, msg: string) {
    setBusy(true);
    setError(null);
    setSaved(null);
    const res = await mbFetch("/api/moms-bible/settings", "PUT", body);
    setBusy(false);
    if (!res.ok) setError(res.error);
    else setSaved(msg);
  }

  async function createInvite() {
    setBusy(true);
    setError(null);
    const res = await mbFetch<{ url: string }>("/api/moms-bible/invites", "POST", { childIds: inviteKids, roleLabel: inviteRole });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setInviteUrl(res.data.url);
    void loadInvites();
  }

  const nameOf = (id: string) => ownChildren.find((c) => c.id === id)?.displayName ?? "";

  return (
    <section className="border border-[var(--color-border)] bg-white p-5 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--color-ink)]">💌 Mom&apos;s Bible</h2>

      <InviteAcceptClient signedIn compact />

      <div className="mt-4 space-y-3 text-sm">
        <label className="mb-field">
          <span className="mb-field__label">Sign my notes as</span>
          <div className="flex gap-2">
            <input
              className="mb-input"
              list="mb-role-choices"
              value={label}
              maxLength={MB_LIMITS.roleLabel}
              onChange={(e) => setLabel(e.target.value)}
            />
            <datalist id="mb-role-choices">
              {MB_ROLE_CHOICES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <button type="button" className="mb-btn mb-btn--ghost" disabled={busy || !label.trim()} onClick={() => void save({ roleLabel: label }, "Saved.")}>
              Save
            </button>
          </div>
        </label>

        <label className="mb-field">
          <span className="mb-field__label">Email me when my child answers a note</span>
          <select
            value={mode}
            disabled={busy}
            onChange={(e) => {
              const v = e.target.value as Props["emailMode"];
              setMode(v);
              void save({ emailMode: v }, "Email setting saved.");
            }}
          >
            <option value="INSTANT">Right away (at most once an hour)</option>
            <option value="DIGEST">Once a day</option>
            <option value="OFF">Never</option>
          </select>
          <span className="text-xs text-[var(--color-muted)]">Emails only say a reply arrived; your child&apos;s words stay in their Bible.</span>
        </label>
      </div>

      {ownChildren.length > 0 && (
        <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm">
          <h3 className="font-bold text-[var(--color-ink)]">Invite another parent</h3>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            They sign in with their own free account and can leave notes too. Plus on either account covers the
            whole family. The link works once, for 7 days.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {ownChildren.map((c) => (
              <label key={c.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={inviteKids.includes(c.id)}
                  onChange={(e) => setInviteKids(e.target.checked ? [...inviteKids, c.id] : inviteKids.filter((x) => x !== c.id))}
                />
                {c.displayName}
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="mb-input"
              list="mb-role-choices"
              value={inviteRole}
              maxLength={MB_LIMITS.roleLabel}
              aria-label="Their role"
              onChange={(e) => setInviteRole(e.target.value)}
            />
            <button
              type="button"
              className="mb-btn mb-btn--primary"
              disabled={busy || inviteKids.length === 0 || !inviteRole.trim()}
              onClick={() => void createInvite()}
            >
              Create invite link
            </button>
          </div>
          {inviteUrl && (
            <div className="mt-3 rounded-xl border border-[#f3d9bf] bg-[#fff3e6] p-3">
              <p className="text-xs font-semibold">Send this link to them yourself (shown once):</p>
              <div className="mt-1 flex gap-2">
                <input className="mb-input" readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} />
                <button type="button" className="mb-btn mb-btn--ghost" onClick={() => void navigator.clipboard?.writeText(inviteUrl)}>
                  Copy
                </button>
              </div>
            </div>
          )}
          {invites.length > 0 && (
            <ul className="mt-3 space-y-1">
              {invites.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 text-xs">
                  <span>
                    Pending: {i.roleLabel} for {i.subProfileIds.map(nameOf).filter(Boolean).join(", ")}
                  </span>
                  <button
                    type="button"
                    className="mb-link"
                    onClick={() => void mbFetch(`/api/moms-bible/invites?id=${i.id}`, "DELETE").then(loadInvites)}
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          )}
          {links.length > 0 && (
            <ul className="mt-3 space-y-1">
              {links.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="break-all">
                    {l.roleLabel} ({l.email}) · {l.childName}
                  </span>
                  <button
                    type="button"
                    className="mb-link"
                    onClick={() => {
                      if (window.confirm(`Remove ${l.roleLabel} from ${l.childName}'s Bible? Their notes stay.`)) {
                        void mbFetch(`/api/moms-bible/links/${l.id}`, "DELETE").then(loadInvites);
                      }
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {joined.length > 0 && (
        <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-sm">
          <h3 className="font-bold text-[var(--color-ink)]">Bibles you were invited to</h3>
          <ul className="mt-2 space-y-1">
            {joined.map((j) => (
              <li key={j.linkId} className="flex items-center justify-between gap-2 text-xs">
                <span>{j.childName}</span>
                <button
                  type="button"
                  className="mb-link"
                  onClick={() => {
                    if (!window.confirm(`Leave ${j.childName}'s Bible?`)) return;
                    void mbFetch(`/api/moms-bible/links/${j.linkId}`, "DELETE").then((r) => {
                      if (r.ok) setJoined((cur) => cur.filter((x) => x.linkId !== j.linkId));
                    });
                  }}
                >
                  Leave
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {saved && <p className="mt-3 text-xs text-green-800">{saved}</p>}
      {error && (
        <p className="mb-error mt-3" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
