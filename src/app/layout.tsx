import { AuthProvider } from "@/components/AuthProvider";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { getGoogleSiteVerification } from "@/lib/google-site-verification";
import { siteMetadata } from "@/lib/site-metadata";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
        <Analytics />
      </body>
    </html>
  );
}
