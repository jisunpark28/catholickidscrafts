"use client";

import {
  CRAFT_GALLERY_AUTHOR_MAX,
  CRAFT_GALLERY_CAPTION_MAX,
  validateCraftGalleryImage,
} from "@/lib/craft-gallery-upload";
import { isHeaderSignedIn, type HeaderSessionResponse } from "@/lib/header-session";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Props = {
  resourceSlug?: string;
  resourceTitle?: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(res.ok ? "Invalid response" : `Request failed (${res.status})`);
  }
}

function defaultAuthorFromSession(session: HeaderSessionResponse | null): string {
  if (!session) return "";
  if (session.reader?.displayName) return session.reader.displayName;
  if (session.family?.displayName?.trim()) return session.family.displayName.trim();
  if (session.family?.email) return session.family.email.split("@")[0] ?? "";
  return "";
}

export function CraftGallerySubmitForm({ resourceSlug, resourceTitle }: Props) {
  const [session, setSession] = useState<HeaderSessionResponse | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signedIn = session ? isHeaderSignedIn(session) : false;

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HeaderSessionResponse | null) => {
        if (cancelled) return;
        setSession(data);
        setAuthorName(defaultAuthorFromSession(data));
        setSessionLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setSessionLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = useCallback((next: File | null) => {
    setError(null);
    setSuccess(null);
    if (!next) {
      setFile(null);
      return;
    }
    const validation = validateCraftGalleryImage(next);
    if (!validation.ok) {
      setError(validation.error);
      setFile(null);
      return;
    }
    setFile(next);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("authorName", authorName.trim());
      if (caption.trim()) formData.set("caption", caption.trim());
      if (resourceSlug) formData.set("resourceSlug", resourceSlug);

      const res = await fetch("/api/gallery/submit", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await readJson<{ message?: string; error?: string }>(res);
      if (!res.ok) {
        setError(data.error ?? "Could not submit photo.");
        return;
      }
      setSuccess(data.message ?? "Submitted for review.");
      setFile(null);
      setCaption("");
    } catch {
      setError("Could not submit photo. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionLoaded) {
    return <p className="text-sm text-[var(--color-muted)]">Loading…</p>;
  }

  if (!signedIn) {
    return (
      <div className="rounded-2xl bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        <p className="font-semibold text-[var(--color-ink)]">Share your craft</p>
        <p className="mt-2">
          <Link href="/account/login" className="font-semibold text-[var(--color-link)]">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/reader/login" className="font-semibold text-[var(--color-link)]">
            Access ID
          </Link>{" "}
          to upload a photo. We review every submission before it appears in the gallery.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[var(--color-border)]/80"
    >
      <h2 className="text-lg font-bold text-[var(--color-ink)]">Share your craft</h2>
      {resourceTitle ? (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Inspired by: <span className="font-semibold text-[var(--color-ink)]">{resourceTitle}</span>
        </p>
      ) : null}
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Upload one photo at a time. An operator will review it before it goes public.
      </p>

      <label className="mt-4 block text-sm font-semibold">
        Photo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 block w-full text-sm"
          onChange={(ev) => onFileChange(ev.target.files?.[0] ?? null)}
        />
      </label>

      {previewUrl ? (
        <div className="mt-3 overflow-hidden rounded-xl bg-[var(--color-surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview" className="max-h-48 w-full object-contain" />
        </div>
      ) : null}

      <label className="mt-4 block text-sm font-semibold">
        Made by
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={CRAFT_GALLERY_AUTHOR_MAX}
          placeholder="e.g. Emma's family"
          className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-normal"
          required
        />
      </label>

      <label className="mt-3 block text-sm font-semibold">
        Caption <span className="font-normal text-[var(--color-muted)]">(optional)</span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={CRAFT_GALLERY_CAPTION_MAX}
          rows={2}
          placeholder="What did you make?"
          className="mt-1 w-full resize-y rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-normal"
        />
      </label>

      {error ? (
        <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 text-sm font-semibold text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !file || !authorName.trim()}
        className="mt-5 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {submitting ? "Uploading…" : "Submit for review"}
      </button>
    </form>
  );
}
