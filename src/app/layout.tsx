import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { getGoogleSiteVerification } from "@/lib/google-site-verification";
import { siteMetadata } from "@/lib/site-metadata";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
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
  // Read at build time (Vercel env is available during the build). Redeploy after changing it.
  // Renders <meta name="google-site-verification" content="..." />; omitted when unset.
  verification: { google: getGoogleSiteVerification() },
  other: {
    ...(siteMetadata.other as Record<string, string | number | (string | number)[]> | undefined),
    // Pinterest domain claim (catholickidscrafts.com) for every page.
    "p:domain_verify": "4cb89808b8a92eab3beb3b60a346229d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        <SiteJsonLd />
        {children}
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  );
}
