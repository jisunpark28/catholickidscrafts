# Liturgical vestments game art and answer audit

The five selectable colors are White, Red, Purple (violet), Green, and Rose (pink).
Light purple/lavender is not a separate liturgical color or a selectable garment.
The archived sixth source tile/PNG is not used by the game or art scripts.

`src/lib/liturgical-vestments-assets.ts` explicitly maps each supported ID to its
reviewed PNG. All five illustrations match their labels and are 960 x 1040.
The default image is white liturgical vestments (a chasuble), not an alb alone.

## Quiz rules (12 rounds)

| Occasion ID | Usual answer | Accepted alternative |
| --- | --- | --- |
| ordinary | green | none |
| christmas | white | none |
| pentecost | red | none |
| advent-1 | purple | none |
| advent-2 | purple | none |
| advent-gaudete | rose | purple |
| advent-4 | purple | none |
| lent-1 | purple | none |
| lent-2 | purple | none |
| lent-3 | purple | none |
| lent-laetare | rose | purple |
| lent-5 | purple | none |

Second Advent/Lent Sundays previously required lavender; they now use purple.
These legitimate questions remain, but no question requires the removed shade.
Gaudete/Laetare previously rejected purple; both rose and purple now score.
Feedback names the actual selected color and explains that rose is optional.
These questions teach the usual seasonal/Sunday colors, not every exception for
special feasts or precious festive vestments. Those exceptions do not make white
an unrestricted substitute for every answer.

Authoritative rule checked: GIRM 346(a-d, f), with special cases in 346(g-h):
https://www.usccb.org/prayer-and-worship/the-mass/general-instruction-of-the-roman-missal/girm-chapter-6

## Source grid (2 rows x 3 columns)

| | Col 1 | Col 2 | Col 3 |
| --- | --- | --- | --- |
| Row 1 | White | Rose (pink) | Red |
| Row 2 | Green | Purple | Unused (legacy lavender) |

`pnpm run vestments:split` extracts only the supported five tiles.
`pnpm run vestments:optimize` normalizes only those five PNGs.

## Regression checks

- `pnpm run test:vestments` checks every question, all 60 answer combinations,
  optional colors, copy keys, rendered-image IDs, reviewed asset hashes, seeded
  shuffles, scoring locks, completion, and restart/reset behavior.
- With a local dev server: `pnpm run test:vestments:browser` exercises every
  answer combination through the rendered game, image loading, feedback, score,
  completion/restart, and mobile layout. Default URL: http://localhost:3027;
  override with VESTMENTS_BASE_URL. No production database or account needed.
