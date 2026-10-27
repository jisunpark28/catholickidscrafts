import { EDITOR_FONTS } from "@/lib/resource/custom-sheet-data";

const GOOGLE =
  "https://fonts.googleapis.com/css2?family=Andika&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Baloo+2:wght@400;700&family=Caveat:wght@400;700&family=Comic+Neue:ital,wght@0,400;0,700;1,400&family=Fredoka:wght@400;600&family=Nunito:ital,wght@0,400;0,700;1,400&family=Patrick+Hand&display=swap";

let loading: Promise<void> | null = null;

/** Inject Google Fonts CSS and wait until canvas can measure glyph widths. */
export function loadEditorFonts(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      if (!document.querySelector(`link[data-ckc-editor-fonts]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = GOOGLE;
        link.dataset.ckcEditorFonts = "1";
        document.head.appendChild(link);
      }
      await Promise.all(
        EDITOR_FONTS.map((f) => document.fonts.load(`16px "${f.id}"`).catch(() => undefined)),
      );
    })();
  }
  return loading;
}
