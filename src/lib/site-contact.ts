/** Public contact email for privacy and site questions (set in Vercel env). */
export function getPublicContactEmail(): string | null {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    process.env.SITE_CONTACT_EMAIL?.trim() ||
    "";
  if (!email.includes("@")) return null;
  // Never treat an env var name as an address (mis-set or leftover template).
  if (/NEXT_PUBLIC_[A-Z0-9_]+/.test(email) || /SITE_CONTACT_EMAIL/.test(email)) {
    return null;
  }
  return email;
}

export function getPublicContactMailto(): string | null {
  const email = getPublicContactEmail();
  return email ? `mailto:${email}` : null;
}
