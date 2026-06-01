import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { LegalPage } from "@/components/LegalPage";
import { AMAZON_ASSOCIATE_DISCLOSURE } from "@/lib/external-links";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How Catholic Kids Crafts uses Amazon Associate and other outbound links.",
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage
      title="Affiliate Disclosure"
      subtitle="Transparency for Amazon and other outbound links"
    >
      <AffiliateDisclosure variant="block" className="mb-6" />

      <p>{AMAZON_ASSOCIATE_DISCLOSURE}</p>

      <h2 className="pt-6 text-xl font-bold">Recommendations</h2>
      <p>
        Some items on our Recommendations pages link to Amazon or other stores. When a link is
        marked as an Amazon Associate link (or points to Amazon), we may earn a small commission if
        you make a qualifying purchase, at no extra cost to you.
      </p>

      <h2 className="pt-4 text-xl font-bold">YouTube and other sites</h2>
      <p>
        Video and website recommendations are provided for convenience. We are not paid by
        YouTube unless otherwise noted in the recommendation itself.
      </p>

      <h2 className="pt-4 text-xl font-bold">Teachers Pay Teachers</h2>
      <p>
        Paid printable packs sold on Teachers Pay Teachers are separate from Amazon. Purchases on
        TPT are between you and TPT / the seller under their terms.
      </p>

      <h2 className="pt-4 text-xl font-bold">Editorial independence</h2>
      <p>
        We only recommend resources we believe are useful for Catholic families and catechists.
        Affiliate relationships do not change our liturgical-season organization or Mass content.
      </p>
    </LegalPage>
  );
}
