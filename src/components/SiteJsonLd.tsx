import { JsonLd } from "@/components/seo/JsonLd";
import { organizationNode, websiteNode } from "@/lib/structured-data";

export function SiteJsonLd() {
  return <JsonLd nodes={[websiteNode(), organizationNode()]} />;
}
