/** Clamp selection so the caret cannot sit in the ghost (untyped) suffix. */
export function clampCaretIndex(index: number, typedLength: number): number {
  return Math.max(0, Math.min(index, typedLength));
}

/** Map a click in the mirror pane to a character index in the passage. */
export function caretIndexFromMirrorPoint(
  mirror: HTMLElement,
  clientX: number,
  clientY: number,
): number {
  if (typeof document.caretRangeFromPoint === "function") {
    const range = document.caretRangeFromPoint(clientX, clientY);
    if (range && mirror.contains(range.startContainer)) {
      const pre = document.createRange();
      pre.selectNodeContents(mirror);
      pre.setEnd(range.startContainer, range.startOffset);
      return pre.toString().length;
    }
  }

  const spans = mirror.querySelectorAll<HTMLElement>("[data-char-index]");
  for (const span of spans) {
    const rect = span.getBoundingClientRect();
    if (
      clientY >= rect.top &&
      clientY <= rect.bottom &&
      clientX >= rect.left &&
      clientX <= rect.right
    ) {
      return Number(span.dataset.charIndex ?? 0);
    }
  }
  return 0;
}

export type CaretPoint = { left: number; top: number; height: number };

/** Pixel position for a custom caret overlay aligned to mirror character spans. */
export function caretPointInMirror(
  mirror: HTMLElement,
  container: HTMLElement,
  index: number,
): CaretPoint | null {
  const clamped = Math.max(0, index);
  const containerRect = container.getBoundingClientRect();

  if (clamped === 0) {
    const first = mirror.querySelector<HTMLElement>('[data-char-index="0"]');
    if (!first) return null;
    const rect = first.getBoundingClientRect();
    return {
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      height: rect.height || parseFloat(getComputedStyle(first).lineHeight) || 20,
    };
  }

  const prev = mirror.querySelector<HTMLElement>(`[data-char-index="${clamped - 1}"]`);
  if (!prev) return null;
  const rect = prev.getBoundingClientRect();
  return {
    left: rect.right - containerRect.left,
    top: rect.top - containerRect.top,
    height: rect.height || parseFloat(getComputedStyle(prev).lineHeight) || 20,
  };
}

/** Scroll the typing pane so the caret is comfortably visible without jumping to the document end. */
export function scrollTypingPaneToCaret(
  textarea: HTMLTextAreaElement,
  mirror: HTMLElement,
  index: number,
): void {
  const span =
    mirror.querySelector<HTMLElement>(`[data-char-index="${Math.max(0, index - 1)}"]`) ??
    mirror.querySelector<HTMLElement>('[data-char-index="0"]');
  if (!span) return;

  const mirrorRect = mirror.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const relativeTop = spanRect.top - mirrorRect.top + mirror.scrollTop;
  const desired = Math.max(0, relativeTop - textarea.clientHeight * 0.35);
  const maxScroll = Math.max(0, textarea.scrollHeight - textarea.clientHeight);
  textarea.scrollTop = Math.min(desired, maxScroll);
  mirror.scrollTop = textarea.scrollTop;
}
