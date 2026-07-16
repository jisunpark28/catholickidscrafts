import type { PrayerCatalogEntry } from "@/lib/prayers/prayer-types";

export const PRAYER_CATEGORY_IDS = [
  "essential",
  "creeds",
  "daily",
  "sacramental",
  "devotional",
] as const;

export type PrayerCategoryId = (typeof PRAYER_CATEGORY_IDS)[number];

export const PRAYER_CATALOG: PrayerCatalogEntry[] = [
  { slug: "sign-of-the-cross", categoryId: "essential", sortOrder: 0 },
  { slug: "our-father", categoryId: "essential", sortOrder: 1 },
  { slug: "hail-mary", categoryId: "essential", sortOrder: 2 },
  { slug: "glory-be", categoryId: "essential", sortOrder: 3 },
  { slug: "fatima-prayer", categoryId: "essential", sortOrder: 4 },
  { slug: "apostles-creed", categoryId: "creeds", sortOrder: 0 },
  { slug: "nicene-creed", categoryId: "creeds", sortOrder: 1 },
  { slug: "morning-offering", categoryId: "daily", sortOrder: 0 },
  { slug: "angelus", categoryId: "daily", sortOrder: 1 },
  { slug: "regina-caeli", categoryId: "daily", sortOrder: 2 },
  { slug: "grace-before-meals", categoryId: "daily", sortOrder: 3 },
  { slug: "grace-after-meals", categoryId: "daily", sortOrder: 4 },
  { slug: "guardian-angel", categoryId: "daily", sortOrder: 5 },
  { slug: "come-holy-spirit", categoryId: "daily", sortOrder: 6 },
  { slug: "act-of-contrition", categoryId: "sacramental", sortOrder: 0 },
  { slug: "anima-christi", categoryId: "sacramental", sortOrder: 1 },
  { slug: "prayer-before-communion", categoryId: "sacramental", sortOrder: 2 },
  { slug: "prayer-after-communion", categoryId: "sacramental", sortOrder: 3 },
  { slug: "memorare", categoryId: "devotional", sortOrder: 0 },
  { slug: "hail-holy-queen", categoryId: "devotional", sortOrder: 1 },
  { slug: "prayer-to-st-michael", categoryId: "devotional", sortOrder: 2 },
  { slug: "prayer-of-st-francis", categoryId: "devotional", sortOrder: 3 },
  { slug: "eternal-rest", categoryId: "devotional", sortOrder: 4 },
  { slug: "sub-tuum", categoryId: "devotional", sortOrder: 5 },
];
