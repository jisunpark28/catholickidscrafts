/** Bump when Tiny Priest static assets change (iframe + asset cache bust). */
export const TINY_PRIEST_ASSET_VERSION = "20260831h";

export function getTinyPriestEmbedPath(): string {
  return `/games/tiny-priest/index.html?v=${TINY_PRIEST_ASSET_VERSION}`;
}
