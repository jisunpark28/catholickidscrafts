"use client";

import { LessonKitWordsEditor } from "@/components/lesson/LessonKitWordsEditor";
import { LessonMediaUpload } from "@/components/lesson/LessonMediaUpload";
import {
  LESSON_BLOCK_DEFAULT_LABEL,
  LESSON_GAME_SLUGS,
  LESSON_RESOURCE_SLUGS,
} from "@/lib/lesson-kit/constants";
import {
  defaultFamilyIncludedByType,
  familyIncludeHint,
} from "@/lib/lesson-kit/family-blocks";
import type { LessonKitWordEntry } from "@/lib/lesson-kit/kit-words";
import { videoEmbedUrlFromLink } from "@/lib/lesson-kit/video-embed";
import {
  lessonImageAlt,
  lessonImageCaption,
  lessonImageSource,
  lessonImageSrc,
  validateLessonImageUrl,
} from "@/lib/lesson-kit/image-block";
import {
  lessonLinkButtonLabel,
  lessonLinkHref,
  validateLessonLinkUrl,
} from "@/lib/lesson-kit/link-block";
import {
  googleSlidesShareToEmbedUrl,
  lessonSlidesAssetUrl,
  lessonSlidesEmbedSrc,
  lessonSlidesOpenLabel,
  lessonSlidesSource,
} from "@/lib/lesson-kit/slides-block";
import {
  lessonWritingMaxChars,
  lessonWritingMinChars,
  lessonWritingMode,
  lessonWritingPlaceholder,
} from "@/lib/lesson-kit/writing-block";
import type { LessonBlockDto } from "@/lib/lesson-kit/types";
import type { FamilyPickMode } from "@/components/lesson/LessonFamilyModePanel";
import type { LessonBlockType } from "@prisma/client";

const BIBLE_BOOK_OPTIONS = [
  { slug: "genesis", label: "Genesis" },
  { slug: "exodus", label: "Exodus" },
  { slug: "psalms", label: "Psalms" },
  { slug: "matthew", label: "Matthew" },
  { slug: "mark", label: "Mark" },
  { slug: "luke", label: "Luke" },
  { slug: "john", label: "John" },
  { slug: "acts", label: "Acts" },
] as const;

type Props = {
  block: LessonBlockDto;
  familyPickMode?: FamilyPickMode;
  onChange: (next: LessonBlockDto) => void;
  onClose: () => void;
};

function fieldLabel(type: LessonBlockType) {
  return LESSON_BLOCK_DEFAULT_LABEL[type];
}

function triStateFamilyInclude(block: LessonBlockDto): "on" | "off" | "default" {
  if (block.config.familyInclude === true) return "on";
  if (block.config.familyInclude === false) return "off";
  return "default";
}

function clearBlockMediaAsset(
  block: LessonBlockDto,
  onChange: (next: LessonBlockDto) => void,
) {
  const nextConfig = { ...block.config };
  delete nextConfig.assetUrl;
  delete nextConfig.assetFilename;
  delete nextConfig.assetMimeType;
  onChange({ ...block, config: nextConfig });
}

function LessonMediaAssetField({
  block,
  patch,
  onChange,
  label,
  hint,
}: {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
  onChange: (next: LessonBlockDto) => void;
  label?: string;
  hint?: string;
}) {
  return (
    <div className="lesson-block-config__field">
      <LessonMediaUpload
        assetUrl={block.config.assetUrl}
        filename={block.config.assetFilename}
        mimeType={block.config.assetMimeType}
        label={label}
        hint={hint}
        onChange={(url, meta) => {
          if (!url) {
            clearBlockMediaAsset(block, onChange);
            return;
          }
          patch({
            assetUrl: url,
            assetFilename: meta?.filename,
            assetMimeType: meta?.mimeType ?? undefined,
          });
        }}
      />
    </div>
  );
}

function LessonLinkConfigFields({
  block,
  patch,
  onChange,
}: {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
  onChange: (next: LessonBlockDto) => void;
}) {
  const urlInput = block.config.url ?? "";
  const validation = urlInput.trim() ? validateLessonLinkUrl(urlInput) : null;
  const previewHref = lessonLinkHref(block);
  const videoPreview = urlInput.trim() ? videoEmbedUrlFromLink(urlInput) : null;

  return (
    <>
      <label className="lesson-block-config__field">
        <span>URL</span>
        <input
          type="url"
          value={urlInput}
          placeholder="https://..."
          onChange={(e) => patch({ url: e.target.value })}
        />
        {validation && !validation.valid ? (
          <p className="mt-1 text-xs font-semibold text-red-600">{validation.error}</p>
        ) : null}
        {videoPreview ? (
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            YouTube / Vimeo links play full-screen during <strong>Run in class</strong>.
          </p>
        ) : null}
      </label>

      <label className="lesson-block-config__field">
        <span>Button label</span>
        <input
          type="text"
          value={block.config.buttonLabel ?? ""}
          placeholder="e.g. Opening prayer"
          onChange={(e) => patch({ buttonLabel: e.target.value })}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
        <input
          type="checkbox"
          checked={block.config.openInNewTab !== false}
          onChange={(e) => patch({ openInNewTab: e.target.checked })}
        />
        Open in new tab
      </label>

      {previewHref ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Preview
          </span>
          <div className="mt-2 flex justify-center rounded border border-dashed border-[var(--color-border)] bg-white p-4">
            <a
              href={previewHref}
              className="lesson-big-button inline-flex no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {lessonLinkButtonLabel(block)}
            </a>
          </div>
          <p className="mt-2 break-all text-xs text-[var(--color-muted)]">{previewHref}</p>
        </div>
      ) : null}

      <LessonMediaAssetField
        block={block}
        patch={patch}
        onChange={onChange}
        label="Or upload a file"
        hint="Image, video (MP4), PDF, or PowerPoint — images and videos show on screen in class"
      />
    </>
  );
}

function LessonImageConfigFields({
  block,
  patch,
  onChange,
}: {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
  onChange: (next: LessonBlockDto) => void;
}) {
  const source = lessonImageSource(block);
  const previewSrc = lessonImageSrc(block);
  const urlInput = block.config.imageUrl ?? "";
  const urlValidation =
    source === "url" && urlInput.trim() ? validateLessonImageUrl(urlInput) : null;

  return (
    <>
      <fieldset className="lesson-block-config__field">
        <legend className="text-sm font-semibold text-[var(--color-ink)]">Image source</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              { value: "upload" as const, label: "Upload" },
              { value: "url" as const, label: "Image URL" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded border px-3 py-2 text-xs font-semibold ${
                source === opt.value
                  ? "border-[var(--color-accent)] bg-white text-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              <input
                type="radio"
                name={`image-source-${block.id}`}
                className="sr-only"
                checked={source === opt.value}
                onChange={() => patch({ imageSource: opt.value })}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {source === "upload" ? (
        <LessonMediaUpload
          assetUrl={block.config.imageUrl}
          filename={block.config.assetFilename}
          mimeType={block.config.assetMimeType}
          accept="image/*"
          label="Upload image"
          hint="PNG, JPG, GIF, WebP · max 10MB"
          imagePreviewUrl={previewSrc ?? undefined}
          onChange={(url, meta) => {
            if (!url) {
              onChange({
                ...block,
                config: {
                  ...block.config,
                  imageUrl: "",
                  imageSource: "upload",
                  assetUrl: undefined,
                  assetFilename: undefined,
                  assetMimeType: undefined,
                },
              });
              return;
            }
            patch({
              imageUrl: url,
              imageSource: "upload",
              assetUrl: url,
              assetFilename: meta?.filename,
              assetMimeType: meta?.mimeType ?? undefined,
            });
          }}
        />
      ) : (
        <label className="lesson-block-config__field">
          <span>Image URL</span>
          <input
            type="url"
            value={urlInput}
            placeholder="https://…/photo.jpg"
            onChange={(e) => patch({ imageUrl: e.target.value, imageSource: "url" })}
          />
          {urlValidation && !urlValidation.valid ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{urlValidation.error}</p>
          ) : null}
        </label>
      )}

      <label className="lesson-block-config__field">
        <span>Alt text (accessibility)</span>
        <input
          type="text"
          value={block.config.alt ?? ""}
          placeholder="Describe the image for screen readers"
          onChange={(e) => patch({ alt: e.target.value })}
        />
      </label>

      <label className="lesson-block-config__field">
        <span>Caption (optional)</span>
        <input
          type="text"
          value={block.config.caption ?? ""}
          placeholder="Short caption shown below the image"
          onChange={(e) => patch({ caption: e.target.value })}
        />
      </label>

      {previewSrc ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Preview
          </span>
          <figure className="lesson-image-figure mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={lessonImageAlt(block)}
              className="lesson-image-figure__img"
            />
            {lessonImageCaption(block) ? (
              <figcaption className="lesson-image-figure__caption">
                {lessonImageCaption(block)}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </>
  );
}

function LessonSlidesConfigFields({
  block,
  patch,
  onChange,
}: {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
  onChange: (next: LessonBlockDto) => void;
}) {
  const source = lessonSlidesSource(block);
  const embedInput = block.config.embedUrl ?? "";
  const embedConversion =
    source === "embed" && embedInput.trim() ? googleSlidesShareToEmbedUrl(embedInput) : null;
  const previewEmbed = lessonSlidesEmbedSrc(block);
  const assetUrl = lessonSlidesAssetUrl(block);

  return (
    <>
      <fieldset className="lesson-block-config__field">
        <legend className="text-sm font-semibold text-[var(--color-ink)]">Slides source</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              {
                value: "embed" as const,
                label: "Google Slides / Drive",
                hint: "Paste a share link — we convert it for embed",
              },
              {
                value: "upload" as const,
                label: "Upload file",
                hint: "PDF recommended; PPTX opens as download",
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded border px-3 py-2 text-xs ${
                source === opt.value
                  ? "border-[var(--color-accent)] bg-white font-semibold text-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              <input
                type="radio"
                name={`slides-source-${block.id}`}
                className="sr-only"
                checked={source === opt.value}
                onChange={() => patch({ slidesSource: opt.value })}
              />
              <span className="block">{opt.label}</span>
              <span className="mt-0.5 block font-normal opacity-80">{opt.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {source === "embed" ? (
        <label className="lesson-block-config__field">
          <span>Google share link</span>
          <input
            type="url"
            value={embedInput}
            placeholder="https://docs.google.com/presentation/d/…/edit"
            onChange={(e) => patch({ embedUrl: e.target.value, slidesSource: "embed" })}
          />
          {embedConversion && !embedConversion.ok ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{embedConversion.error}</p>
          ) : null}
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Use a link anyone with the link can view. Google Slides and Drive file links work.
          </p>
        </label>
      ) : (
        <>
          <LessonMediaUpload
            assetUrl={block.config.assetUrl}
            filename={block.config.assetFilename}
            mimeType={block.config.assetMimeType}
            accept="application/pdf,.pdf,.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            label="Upload slides"
            hint="PDF plays inline in class. PowerPoint downloads only — export to PDF for projector view."
            onChange={(url, meta) => {
              if (!url) {
                onChange({
                  ...block,
                  config: {
                    ...block.config,
                    slidesSource: "upload",
                    assetUrl: undefined,
                    assetFilename: undefined,
                    assetMimeType: undefined,
                  },
                });
                return;
              }
              patch({
                slidesSource: "upload",
                assetUrl: url,
                assetFilename: meta?.filename,
                assetMimeType: meta?.mimeType ?? undefined,
              });
            }}
          />
        </>
      )}

      <label className="lesson-block-config__field">
        <span>Open button label (upload / fallback)</span>
        <input
          type="text"
          value={block.config.buttonLabel ?? ""}
          placeholder="Open slides"
          onChange={(e) => patch({ buttonLabel: e.target.value })}
        />
      </label>

      {previewEmbed ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Embed preview
          </span>
          <div className="lesson-slides-embed mt-2">
            <iframe
              title={lessonSlidesOpenLabel(block)}
              src={previewEmbed}
              className="lesson-slides-embed__frame lesson-slides-embed__frame--editor"
            />
          </div>
          <p className="mt-2 break-all text-xs text-[var(--color-muted)]">{previewEmbed}</p>
        </div>
      ) : null}

      {source === "upload" && assetUrl ? (
        <p className="text-xs text-[var(--color-muted)]">
          Uploaded:{" "}
          <a href={assetUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-link)]">
            {block.config.assetFilename ?? "Open file"}
          </a>
        </p>
      ) : null}
    </>
  );
}

function LessonWritingConfigFields({
  block,
  patch,
  onChange,
}: {
  block: LessonBlockDto;
  patch: (partial: Partial<LessonBlockDto["config"]>) => void;
  onChange: (next: LessonBlockDto) => void;
}) {
  const mode = lessonWritingMode(block);
  const prompt = block.config.prompt ?? "";
  const minChars = lessonWritingMinChars(block);
  const maxChars = lessonWritingMaxChars(block);

  return (
    <>
      <fieldset className="lesson-block-config__field">
        <legend className="text-sm font-semibold text-[var(--color-ink)]">Mode</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              {
                value: "student" as const,
                label: "Student writes",
                hint: "Shows a text box during Run",
              },
              {
                value: "display" as const,
                label: "Display only",
                hint: "Prompt for class discussion (no text box)",
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded border px-3 py-2 text-xs ${
                mode === opt.value
                  ? "border-[var(--color-accent)] bg-white font-semibold text-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              <input
                type="radio"
                name={`writing-mode-${block.id}`}
                className="sr-only"
                checked={mode === opt.value}
                onChange={() => patch({ writingMode: opt.value })}
              />
              <span className="block">{opt.label}</span>
              <span className="mt-0.5 block font-normal opacity-80">{opt.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="lesson-block-config__field">
        <span>Prompt / question</span>
        <textarea
          rows={4}
          value={prompt}
          placeholder="What should students think or write about?"
          onChange={(e) => patch({ prompt: e.target.value })}
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Plain text for now. Rich text formatting may come later.
        </p>
      </label>

      {mode === "student" ? (
        <>
          <label className="lesson-block-config__field">
            <span>Placeholder (optional)</span>
            <input
              type="text"
              value={block.config.placeholder ?? ""}
              onChange={(e) => patch({ placeholder: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="lesson-block-config__field">
              <span>Minimum characters</span>
              <input
                type="number"
                min={0}
                max={maxChars}
                value={minChars}
                onChange={(e) =>
                  patch({ minChars: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </label>
            <label className="lesson-block-config__field">
              <span>Maximum characters</span>
              <input
                type="number"
                min={20}
                max={2000}
                value={maxChars}
                onChange={(e) =>
                  patch({ maxChars: Math.min(2000, Math.max(20, Number(e.target.value) || 200)) })
                }
              />
            </label>
          </div>
        </>
      ) : null}

      {prompt.trim() ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Preview
          </span>
          <div className="lesson-note mt-2 whitespace-pre-wrap">{prompt.trim()}</div>
          {mode === "student" ? (
            <textarea
              className="lesson-writing-field mt-3"
              rows={4}
              readOnly
              placeholder={lessonWritingPlaceholder(block)}
              aria-hidden
              tabIndex={-1}
            />
          ) : null}
        </div>
      ) : null}

      <LessonMediaAssetField
        block={block}
        patch={patch}
        onChange={onChange}
        label="Teacher reference file (optional)"
        hint="Worksheet or image for your own use — not shown during Run yet"
      />
    </>
  );
}

export function LessonBlockConfigPanel({
  block,
  familyPickMode = "auto",
  onChange,
  onClose,
}: Props) {
  const patch = (partial: Partial<LessonBlockDto["config"]>, label?: string | null) => {
    onChange({
      ...block,
      label: label !== undefined ? label : block.label,
      config: { ...block.config, ...partial },
    });
  };

  const familyState = triStateFamilyInclude(block);
  const defaultOn = defaultFamilyIncludedByType(block.type);

  return (
    <div className="lesson-block-config border border-[var(--color-border)] bg-[#fffaf5] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-[var(--color-ink)]">
          Edit {fieldLabel(block.type)}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          Done
        </button>
      </div>

      <label className="lesson-block-config__field">
        <span>Step label (optional)</span>
        <input
          type="text"
          value={block.label ?? ""}
          placeholder={fieldLabel(block.type)}
          onChange={(e) => onChange({ ...block, label: e.target.value || null })}
        />
      </label>

      {block.type === "PLAY_GAME" && (
        <>
          <label className="lesson-block-config__field">
            <span>Game</span>
            <select
              value={block.config.gameSlug ?? LESSON_GAME_SLUGS[0]!.slug}
              onChange={(e) => patch({ gameSlug: e.target.value })}
            >
              {LESSON_GAME_SLUGS.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          {block.config.gameSlug === "hangman" || block.config.gameSlug === "typing" ? (
            <LessonKitWordsEditor
              block={block}
              onChange={(entries: LessonKitWordEntry[]) =>
                patch({ kitWords: entries, wordPreset: undefined, wordIds: undefined })
              }
            />
          ) : null}
        </>
      )}

      {block.type === "TYPING_WORDS" && (
        <LessonKitWordsEditor
          block={block}
          onChange={(entries: LessonKitWordEntry[]) =>
            patch({ kitWords: entries, wordPreset: undefined, wordIds: undefined })
          }
        />
      )}

      {block.type === "GOSPEL_TYPING" && (
        <label className="lesson-block-config__field">
          <span>Max characters (class)</span>
          <input
            type="number"
            min={80}
            max={1200}
            value={block.config.maxChars ?? 400}
            onChange={(e) => patch({ maxChars: Number(e.target.value) || 400, readingKind: "gospel" })}
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            At-home Gospel length is set in At-home link above.
          </p>
        </label>
      )}

      {block.type === "BIBLE_CHAPTER" && (
        <>
          <label className="lesson-block-config__field">
            <span>Book</span>
            <select
              value={block.config.bookSlug ?? "matthew"}
              onChange={(e) => patch({ bookSlug: e.target.value })}
            >
              {BIBLE_BOOK_OPTIONS.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="lesson-block-config__field">
            <span>Chapter</span>
            <input
              type="number"
              min={1}
              max={150}
              value={block.config.chapter ?? 1}
              onChange={(e) => patch({ chapter: Number(e.target.value) || 1 })}
            />
          </label>
          <label className="lesson-block-config__field">
            <span>Max characters (optional)</span>
            <input
              type="number"
              min={80}
              max={1200}
              value={block.config.maxChars ?? ""}
              placeholder="Default"
              onChange={(e) => {
                const n = e.target.value ? Number(e.target.value) : undefined;
                patch({ maxChars: n });
              }}
            />
          </label>
        </>
      )}

      {block.type === "RESOURCE" && (
        <label className="lesson-block-config__field">
          <span>Activity</span>
          <select
            value={block.config.resourceSlug ?? LESSON_RESOURCE_SLUGS[0]!.slug}
            onChange={(e) => patch({ resourceSlug: e.target.value })}
          >
            {LESSON_RESOURCE_SLUGS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {block.type === "LINK" && (
        <LessonLinkConfigFields block={block} patch={patch} onChange={onChange} />
      )}

      {block.type === "IMAGE" && (
        <LessonImageConfigFields block={block} patch={patch} onChange={onChange} />
      )}

      {block.type === "SLIDES" && (
        <LessonSlidesConfigFields block={block} patch={patch} onChange={onChange} />
      )}

      {block.type === "CUSTOM_NOTE" && (
        <>
          <p className="text-xs text-[var(--color-muted)]">
            Teacher-only notes for the classroom. Hidden from the at-home link by default.
          </p>
          <label className="lesson-block-config__field">
            <span>Teacher note (HTML)</span>
            <textarea
              rows={4}
              value={block.config.html ?? ""}
              onChange={(e) => patch({ html: e.target.value })}
            />
          </label>
        </>
      )}

      {block.type === "WRITING" && (
        <LessonWritingConfigFields block={block} patch={patch} onChange={onChange} />
      )}

      {block.type === "HANGMAN_WORDS" && (
        <LessonKitWordsEditor
          block={block}
          onChange={(entries: LessonKitWordEntry[]) =>
            patch({ kitWords: entries, gameSlug: "hangman" })
          }
        />
      )}

      {block.type === "MASS_TODAY" && (
        <p className="text-xs text-[var(--color-muted)]">
          Links to today&apos;s Mass calendar page.
        </p>
      )}

      {familyPickMode === "auto" ? (
        <div className="lesson-block-config__field mt-2 border-t border-[var(--color-border)] pt-3">
          <span className="font-semibold text-[var(--color-ink)]">At-home link</span>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{familyIncludeHint(block)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { value: "default" as const, label: defaultOn ? "Default (on)" : "Default (off)" },
                { value: "on" as const, label: "Always on" },
                { value: "off" as const, label: "Class only" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded border px-3 py-1.5 text-xs font-semibold ${
                  familyState === opt.value
                    ? "border-[var(--color-accent)] bg-white text-[var(--color-ink)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                <input
                  type="radio"
                  name={`family-${block.id}`}
                  className="sr-only"
                  checked={familyState === opt.value}
                  onChange={() => {
                    if (opt.value === "default") {
                      const nextConfig = { ...block.config };
                      delete nextConfig.familyInclude;
                      onChange({ ...block, config: nextConfig });
                    } else {
                      patch({ familyInclude: opt.value === "on" });
                    }
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
          At-home steps are chosen in <strong>Pick exact steps</strong> above.
        </p>
      )}
    </div>
  );
}
