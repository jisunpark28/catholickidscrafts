"use client";

import { useRef, useState } from "react";

type UploadMeta = {
  filename?: string;
  mimeType?: string | null;
  sizeBytes?: number;
};

type Props = {
  assetUrl?: string;
  filename?: string;
  mimeType?: string | null;
  onChange: (assetUrl: string | undefined, meta?: UploadMeta) => void;
  label?: string;
  hint?: string;
};

export function LessonMediaUpload({
  assetUrl,
  filename,
  mimeType,
  onChange,
  label = "Upload file",
  hint = "Images, PDF, or PowerPoint · max 10MB",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/program/uploads", { method: "POST", body });
      const json = (await res.json()) as {
        assetUrl?: string;
        filename?: string;
        mimeType?: string | null;
        sizeBytes?: number;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "Upload failed");
      }
      if (!json.assetUrl) {
        throw new Error("Upload did not return a URL");
      }
      onChange(json.assetUrl, {
        filename: json.filename,
        mimeType: json.mimeType,
        sizeBytes: json.sizeBytes,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="lesson-media-upload">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">{label}</span>
        {assetUrl ? (
          <button
            type="button"
            className="text-xs font-semibold text-red-600 hover:underline"
            onClick={() => onChange(undefined)}
            disabled={uploading}
          >
            Remove
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</p> : null}

      {assetUrl ? (
        <div className="mt-2 rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm">
          <a
            href={assetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--color-link)] break-all"
          >
            {filename ?? "Uploaded file"}
          </a>
          {mimeType ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">{mimeType}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <button
          type="button"
          className="rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)] disabled:opacity-60"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : assetUrl ? "Replace file" : "Choose file"}
        </button>
      </div>

      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
