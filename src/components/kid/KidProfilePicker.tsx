"use client";

import { KidPinPad } from "@/components/kid/KidPinPad";
import { notifySessionChanged } from "@/components/SiteSessionProvider";
import { isValidKidCode, normalizeKidCode } from "@/lib/kids/kid-code-format";
import {
  readKidProfiles,
  removeKidProfile,
  saveKidProfile,
  type KidDeviceProfile,
} from "@/lib/kids/kid-device-profiles";
import { KID_LOGIN_GENERIC_ERROR, KID_LOGIN_LABELS as L } from "@/lib/kids/kid-login-copy";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  /** True only when a parent (not child mode) is signed in on this device. */
  canEditProfiles: boolean;
  /** Where to go after sign-in. */
  next?: string;
};

type View = { kind: "pick" } | { kind: "pin"; profile: KidDeviceProfile } | { kind: "add" };

const TILE_COLORS = ["#e07b39", "#4f8fdc", "#4caf7a", "#c76bb8", "#d9a42b", "#5aa6a6", "#8a76d6", "#d0605e"];

function initial(name: string) {
  return (name.trim()[0] ?? "?").toUpperCase();
}

async function signIn(code: string, pin: string): Promise<{ ok: true; profile: KidDeviceProfile } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/auth/kid/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, pin }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      profile?: KidDeviceProfile;
    };
    if (!res.ok || !data.profile) return { ok: false, error: data.error ?? KID_LOGIN_GENERIC_ERROR };
    return { ok: true, profile: data.profile };
  } catch {
    return { ok: false, error: KID_LOGIN_GENERIC_ERROR };
  }
}

export function KidProfilePicker({ canEditProfiles, next = "/bible/genesis" }: Props) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<KidDeviceProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>({ kind: "pick" });
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [addCode, setAddCode] = useState("");

  useEffect(() => {
    const list = readKidProfiles();
    setProfiles(list);
    setLoaded(true);
    if (list.length === 0) setView({ kind: "add" });
  }, []);

  function done(profile: KidDeviceProfile) {
    // Only Kid Code + first name are stored on the device.
    setProfiles(saveKidProfile({ code: profile.code, name: profile.name }));
    router.push(next);
    router.refresh();
    // The site header loads the session in the browser: reload it for the new child reader.
    notifySessionChanged();
  }

  async function submit(code: string, pin: string) {
    setBusy(true);
    setError("");
    const result = await signIn(code, pin);
    setBusy(false);
    if (result.ok) {
      done(result.profile);
      return;
    }
    setError(result.error);
    setResetKey((k) => k + 1);
  }

  function openPin(profile: KidDeviceProfile) {
    setError("");
    setView({ kind: "pin", profile });
    setResetKey((k) => k + 1);
  }

  function goBack() {
    setError("");
    setAddCode("");
    setView({ kind: "pick" });
  }

  function remove(profile: KidDeviceProfile) {
    if (!canEditProfiles) return;
    if (!window.confirm(L.removeConfirm(profile.name))) return;
    const list = removeKidProfile(profile.code);
    setProfiles(list);
    if (list.length === 0) setEditing(false);
  }

  if (!loaded) return <div className="min-h-[20rem]" aria-busy />;

  const addCodeNormalized = normalizeKidCode(addCode);
  const addCodeValid = isValidKidCode(addCodeNormalized);

  return (
    <div className="w-full max-w-2xl">
      {error && (
        <p role="alert" className="mx-auto mb-6 max-w-md border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {view.kind === "pick" && (
        <div>
          <ul className="flex flex-wrap justify-center gap-6">
            {profiles.map((p, i) => (
              <li key={p.code} className="relative">
                <button
                  type="button"
                  disabled={editing}
                  onClick={() => openPin(p)}
                  className="group flex w-28 flex-col items-center gap-2 disabled:cursor-default"
                >
                  <span
                    className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold text-white shadow-sm transition group-hover:scale-105 group-disabled:group-hover:scale-100"
                    style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
                  >
                    {initial(p.name)}
                  </span>
                  <span className="max-w-full truncate text-base font-semibold text-[var(--color-ink)]">{p.name}</span>
                </button>
                {editing && canEditProfiles && (
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="absolute -right-1 -top-1 rounded-full border border-red-200 bg-white px-2 py-0.5 text-xs font-bold text-red-700 shadow"
                    aria-label={`${L.remove} ${p.name}`}
                  >
                    ✕ {L.remove}
                  </button>
                )}
              </li>
            ))}
            {!editing && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView({ kind: "add" });
                  }}
                  className="group flex w-28 flex-col items-center gap-2"
                >
                  <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] text-4xl text-[var(--color-muted)] transition group-hover:border-[var(--color-accent)]">
                    ➕
                  </span>
                  <span className="text-base font-semibold text-[var(--color-ink)]">{L.addKid}</span>
                </button>
              </li>
            )}
          </ul>
          {profiles.length > 0 && (
            <div className="mt-8 text-center">
              {canEditProfiles ? (
                <button
                  type="button"
                  onClick={() => setEditing((v) => !v)}
                  className="border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
                >
                  {editing ? L.doneEditing : L.editProfiles}
                </button>
              ) : (
                <p className="text-xs text-[var(--color-muted)]">{L.editNeedsParent}</p>
              )}
            </div>
          )}
        </div>
      )}

      {view.kind === "pin" && (
        <div className="flex flex-col items-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold text-white"
            style={{
              background:
                TILE_COLORS[Math.max(0, profiles.findIndex((p) => p.code === view.profile.code)) % TILE_COLORS.length],
            }}
          >
            {initial(view.profile.name)}
          </span>
          <p className="mt-3 text-xl font-bold text-[var(--color-ink)]">{view.profile.name}</p>
          <p className="mb-6 mt-1 text-sm text-[var(--color-muted)]">{L.enterPin}</p>
          <KidPinPad
            label={L.enterPin}
            disabled={busy}
            resetKey={resetKey}
            onComplete={(pin) => void submit(view.profile.code, pin)}
          />
          {busy && <p className="mt-4 text-sm text-[var(--color-muted)]">{L.signingIn}</p>}
          <button type="button" onClick={goBack} className="mt-6 text-sm font-semibold text-[var(--color-link)]">
            ← {L.back}
          </button>
        </div>
      )}

      {view.kind === "add" && (
        <div className="mx-auto flex max-w-md flex-col items-center">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">{L.addKidTitle}</h2>
          <label className="mt-4 block w-full text-sm font-semibold text-[var(--color-ink)]">
            {L.kidCode}
            <input
              type="text"
              value={addCode}
              onChange={(e) => setAddCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={20}
              placeholder={L.kidCodePlaceholder}
              className="mt-1 w-full border border-[var(--color-border)] bg-white px-3 py-2 font-mono text-lg font-normal tracking-wide"
            />
          </label>
          <p className="mb-5 mt-5 text-sm text-[var(--color-muted)]">{L.enterPin}</p>
          <KidPinPad
            label={L.enterPin}
            disabled={busy || !addCodeValid}
            resetKey={resetKey}
            onComplete={(pin) => void submit(addCodeNormalized, pin)}
          />
          {busy && <p className="mt-4 text-sm text-[var(--color-muted)]">{L.signingIn}</p>}
          {profiles.length > 0 && (
            <button type="button" onClick={goBack} className="mt-6 text-sm font-semibold text-[var(--color-link)]">
              ← {L.back}
            </button>
          )}
        </div>
      )}

      <p className="mx-auto mt-10 max-w-md text-center text-xs leading-relaxed text-[var(--color-muted)]">{L.parentHint}</p>
    </div>
  );
}
