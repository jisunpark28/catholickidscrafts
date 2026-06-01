import {
  externalLinkRel,
  isAmazonAffiliateLink,
} from "@/lib/external-links";
import type { ExternalLinkType } from "@prisma/client";
import type { ComponentProps } from "react";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

type Props = ComponentProps<"a"> & {
  href: string;
  linkType?: ExternalLinkType;
  showAffiliateNote?: boolean;
};

export function ExternalLink({
  href,
  linkType = "STANDARD",
  showAffiliateNote = false,
  children,
  className,
  ...rest
}: Props) {
  const affiliate = isAmazonAffiliateLink(linkType, href);

  return (
    <span className={affiliate && showAffiliateNote ? "block space-y-2" : undefined}>
      <a
        href={href}
        target="_blank"
        rel={externalLinkRel(linkType, href)}
        className={className}
        {...rest}
      >
        {children}
      </a>
      {affiliate && showAffiliateNote && (
        <AffiliateDisclosure variant="short" className="max-w-xl" />
      )}
    </span>
  );
}
