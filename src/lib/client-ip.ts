/** Client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return "unknown";
}
