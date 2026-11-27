/**
 * Four-parts guide content. Only items with status "live" are rendered as links.
 * Concluding-rites worksheet stays planned until that page exists.
 * Paragraph numbers below were checked against vatican.va or usccb.org before use.
 */

export type MassPartResourceKind = "guide" | "worksheet" | "craft" | "activity" | "prayer" | "virtue";
export type MassPartTier = "public" | "signin" | "plus";
export type MassPartStatus = "live" | "planned";

export type MassPartResourceItem = {
  label: string;
  kind: MassPartResourceKind;
  /** Real path. Ignored unless status is live. */
  href: string;
  tier?: MassPartTier;
  status: MassPartStatus;
};

export type MassPartBlock = {
  order: 1 | 2 | 3 | 4;
  id: "introductory-rites" | "liturgy-of-the-word" | "liturgy-of-the-eucharist" | "concluding-rites";
  title: string;
  posture: string;
  kidResponse: string;
  whatToSpot: string[];
  keyThemes: { label: string; kidNote: string }[];
  resources: MassPartResourceItem[];
};

export const MASS_PARTS: readonly MassPartBlock[] = [
  {
    order: 1,
    id: "introductory-rites",
    title: "Introductory Rites",
    posture: "We stand as Mass begins.",
    kidResponse: "We begin in the name of the Father, and of the Son, and of the Holy Spirit.",
    whatToSpot: ["Holy water font", "The priest's greeting", "People standing together"],
    keyThemes: [
      { label: "We gather", kidNote: "Mass starts by bringing us into one family before we listen and before we come to the altar." },
      { label: "We say sorry", kidNote: "The Penitential Act at Mass is a prayer for mercy. It is not the same as the Sacrament of Penance." },
    ],
    resources: [
      {
        label: "Introductory Rites worksheet",
        kind: "worksheet",
        href: "/catholic-mass-for-kids/introductory-rites",
        tier: "plus",
        status: "live",
      },
    ],
  },
  {
    order: 2,
    id: "liturgy-of-the-word",
    title: "Liturgy of the Word",
    posture: "We sit to listen, then stand for the Gospel.",
    kidResponse: "We listen while God speaks in the readings, and we stand when the Gospel is proclaimed.",
    whatToSpot: ["The ambo, where Scripture is read", "The Book of the Gospels", "People standing for the Gospel"],
    keyThemes: [
      { label: "A main part of Mass", kidNote: "With the Liturgy of the Eucharist, this is one of the two great parts that make one act of worship." },
      { label: "We answer with faith", kidNote: "After we hear the Word, we profess our faith and pray for the Church and the world." },
    ],
    resources: [
      {
        label: "Liturgy of the Word worksheet",
        kind: "worksheet",
        href: "/catholic-mass-for-kids/liturgy-of-the-word",
        tier: "plus",
        status: "live",
      },
    ],
  },
  {
    order: 3,
    id: "liturgy-of-the-eucharist",
    title: "Liturgy of the Eucharist",
    posture: "In the United States we kneel after the Holy, Holy, Holy, unless we cannot.",
    kidResponse: "We answer Amen, trusting that the bread and wine have become Jesus' Body and Blood.",
    whatToSpot: ["The altar", "Bread and wine", "The tabernacle"],
    keyThemes: [
      { label: "A main part of Mass", kidNote: "This is the other great part of the one act of worship, joined to the Liturgy of the Word." },
      { label: "Jesus is truly present", kidNote: "Christ is wholly and entirely present under the form of bread, and wholly and entirely present under the form of wine." },
    ],
    resources: [
      {
        label: "Liturgy of the Eucharist worksheet",
        kind: "worksheet",
        href: "/catholic-mass-for-kids/liturgy-of-the-eucharist",
        tier: "plus",
        status: "live",
      },
    ],
  },
  {
    order: 4,
    id: "concluding-rites",
    title: "Concluding Rites",
    posture: "We stand for the blessing and the sending.",
    kidResponse: "We thank God and go out to love our neighbor.",
    whatToSpot: ["The final blessing", "The dismissal", "People leaving to do good"],
    keyThemes: [
      { label: "We are sent", kidNote: "The priest blesses us and sends us to praise God by the way we live." },
      { label: "Mass continues in love", kidNote: "The church door is not the end of the Gospel. We carry it home." },
    ],
    resources: [
      {
        label: "Concluding Rites worksheet",
        kind: "worksheet",
        href: "/catholic-mass-for-kids/concluding-rites",
        tier: "plus",
        status: "planned",
      },
    ],
  },
];

export function liveResources(part: MassPartBlock): MassPartResourceItem[] {
  return part.resources.filter((item) => item.status === "live" && item.href.startsWith("/"));
}
