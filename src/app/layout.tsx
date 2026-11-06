import { AuthProvider } from "@/components/AuthProvider";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { getGoogleSiteVerification } from "@/lib/google-site-verification";
import { siteMetadata } from "@/lib/site-metadata";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { connection } from "next/server";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  variable: "--font-inter",
  src: "../assets/fonts/inter-variable.ttf",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  ...siteMetadata,
  other: {
    ...(siteMetadata.other as Record<string, string | number | (string | number)[]> | undefined),
    // Pinterest domain claim (catholickidscrafts.com) for every page.
    "p:domain_verify": "4cb89808b8a92eab3beb3b60a346229d",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read Vercel env at request time so GOOGLE_SITE_VERIFICATION works without a stale static build.
  await connection();
  const googleSiteVerification = getGoogleSiteVerification();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {googleSiteVerification ? (
          <meta name="google-site-verification" content={googleSiteVerification} />
        ) : null}
      </head>
      <body
        className={`${inter.variable} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        <SiteJsonLd />
        <AuthProvider>{children}</AuthProvider>
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  );
}
