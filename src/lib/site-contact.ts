/** Public contact email for privacy and site questions (set in Vercel env). */
export function getPublicContactEmail(): string | null {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    process.env.SITE_CONTACT_EMAIL?.trim();
  if (!email || !email.includes("@")) return null;
  return email;
}

export function getPublicContactMailto(): string | null {
  const email = getPublicContactEmail();
  return email ? `mailto:${email}` : null;
}
