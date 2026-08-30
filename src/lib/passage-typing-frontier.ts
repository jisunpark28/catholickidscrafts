/**
 * Frontier typing helpers for side-by-side ghost suffix mode.
 * When the textarea shows typed text + ghost suffix, confirming a ghost character
 * may not change the composed value — these helpers still advance typed state.
 */

export function tryAppendMatchingFrontier(
  currentTyped: string,
  target: string,
  insertText: string,
): string | null {
  if (!insertText || currentTyped.length >= target.length) return null;

  let built = currentTyped;
  for (const ch of insertText) {
    if (built.length >= target.length) return null;
    if (target[built.length] !== ch) return null;
    built += ch;
  }

  return built.length > currentTyped.length ? built : null;
}

export function tryConfirmGhostSuffixAtSelection(
  currentTyped: string,
  target: string,
  selectionStart: number,
  selectionEnd: number,
): string | null {
  if (currentTyped.length >= target.length) return null;
  if (selectionStart !== selectionEnd) return null;
  if (currentTyped.length >= target.length) return null;

  const nextChar = target[currentTyped.length]!;
  const composed = currentTyped + target.slice(currentTyped.length);
  if (selectionStart > currentTyped.length && composed[selectionStart] === nextChar) {
    return currentTyped + nextChar;
  }

  return null;
}

/** @deprecated Use {@link tryConfirmGhostSuffixAtSelection}. */
export function appendAtFrontierIfGhostMatch(
  currentTyped: string,
  target: string,
  selectionStart: number,
  selectionEnd: number,
): string | null {
  return tryConfirmGhostSuffixAtSelection(
    currentTyped,
    target,
    selectionStart,
    selectionEnd,
  );
}
