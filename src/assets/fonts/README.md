# Bundled site fonts

These are the existing Fredoka and Inter families, not replacement typefaces.
They are loaded with next/font/local so builds never parse Google Fonts CSS.
Both upstream fonts are SIL OFL 1.1; the complete copyright notices/licenses are
alongside the files. Pinned official google/fonts source URLs and SHA-256 hashes
are recorded in provenance.json. Retrieved November 6, 2026.

Full upstream character coverage is retained (not just a Latin-only subset).
Only the non-weight axes are pinned to the defaults used by the previous Google
Fonts requests: Fredoka wdth=100 and Inter opsz=14. Weight stays variable:
Fredoka supports 300-700 (the app requests 500-700); Inter supports 100-900.
Existing CSS variables, scope and display:swap are unchanged.

Preparation used FontTools 4.63.0, recalcTimestamp=False:

    font = TTFont(upstream_path, recalcTimestamp=False)
    instance = instantiateVariableFont(font, {"wdth": 100}, inplace=False)  # Fredoka
    instance.save("fredoka-variable.ttf")

For Inter, use {"opsz": 14} and save inter-variable.ttf. This pins only unused
axes and retains the complete wght axis and cmap; no glyph artwork is redrawn.
The included licenses declare no Reserved Font Names.

Regression check: pnpm exec tsx scripts/test-local-fonts.ts
After next build: pnpm exec tsx scripts/test-local-fonts.ts --built

## PR 312 failure investigation

The full failed deployment log (dpl_AE9Y8jJFZwzKcoeR61Uq1DW9SAcw) reports
TypeError: Cannot read properties of null (reading '1') in Next 15.5.18's
Google font loader, line 122. That line unconditionally reads regex capture [1]
from a URL-ending extension match. This is a parser error, not a logged network
failure. The precise failing URL is not printed in the deployment log.
An extensionless /l/font?kit=... fixture reproduces the identical stack in the
installed loader. Upstream explanation: https://github.com/vercel/next.js/issues/99114

The same unchanged PR commit f35e181 subsequently deployed successfully at
17:00:35 America/Toronto (EST) on November 6. Its GitHub Actions build also passed.
This fix removes the intermittent dependency for BOTH Google font imports;
leaving Inter on next/font/google would leave the same failure path in place.
No Next/React version, Play UI, sidebar, or other typography styles are changed.
