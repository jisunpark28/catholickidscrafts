import { AuthProvider } from "@/components/AuthProvider";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { getGoogleSiteVerification } from "@/lib/google-site-verification";
import { siteMetadata } from "@/lib/site-metadata";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Schoolbell } from "next/font/google";
import "./globals.css";

const schoolbell = Schoolbell({
  variable: "--font-schoolbell",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = siteMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read Vercel env at request time so GOOGLE_SITE_VERIFICATION works without a stale static build.
  await connection();
  const googleSiteVerification = getGoogleSiteVerification();

  return (
    <html lang="en">
      <head>
        {googleSiteVerification ? (
          <meta name="google-site-verification" content={googleSiteVerification} />
        ) : null}
      </head>
      <body className={`${schoolbell.variable} min-h-screen font-sans antialiased`}>
        <SiteJsonLd />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
