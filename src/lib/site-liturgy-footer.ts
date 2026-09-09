/** Public-site footer: how Daily Mass and related pages source liturgical data.
 * Kept in a client-safe module so SiteFooter does not pull `romcal` (lodash templates
 * use `new Function()`, which enforcing CSP blocks without `'unsafe-eval'`).
 */
export const SITE_LITURGY_FOOTER =
  "Liturgical calendar: Evangelizo.org · Mass readings: USCCB, Living with Christ & GoodNews (external links only)";
