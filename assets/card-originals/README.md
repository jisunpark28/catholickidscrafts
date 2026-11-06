# Evergreen picture card originals

28 designed faces for Order of the Mass and Family Virtue Challenge.

Regenerate from cards.json with `node scripts/build-evergreen-card-faces.mjs`.
This writes 1080 x 1350 PNGs here, 432 x 540 sharp WebP previews in
`public/cards/thumbs`, and 216 x 270 blurred grayscale WebPs in
`public/cards/locked`. Titles, captions and Scripture references come directly
from the catalog; these are warm vector-designed faces, not painted artwork.

This directory is deliberately outside `public`. The allowlisted manifest in
`src/data/cards/designed-originals.json` selects these 28 originals. The existing
card download API checks parent/Plus entitlements (or today's featured-card rule)
before reading them. Next output-file tracing includes the PNGs in that function.
No Blob upload or secret is needed for these bundled originals. Older cards
continue to use private Blob/local-dev storage unchanged.
