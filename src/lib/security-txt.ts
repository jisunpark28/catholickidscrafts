import { getPublicContactEmail } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";

/** RFC 9116 security.txt — expires end of 2027. */
export const SECURITY_TXT_EXPIRES = "2027-12-31T23:59:59.000Z";

export function buildSecurityTxt(): string {
  const site = getSiteUrl();
  const email = getPublicContactEmail();
  const contact = email ? `mailto:${email}` : `${site}/privacy`;
  return [
    `Contact: ${contact}`,
    "Preferred-Languages: en, ko",
    `Expires: ${SECURITY_TXT_EXPIRES}`,
    `Canonical: ${site}/.well-known/security.txt`,
    `Policy: ${site}/privacy`,
  ].join("\n") + "\n";
}
