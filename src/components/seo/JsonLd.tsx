import { jsonLdGraph, serializeJsonLd, type JsonLdNode } from "@/lib/structured-data";

/** Renders schema.org nodes as one safely escaped JSON-LD script tag. */
export function JsonLd({ nodes }: { nodes: JsonLdNode[] }) {
  if (nodes.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdGraph(nodes)) }}
    />
  );
}
