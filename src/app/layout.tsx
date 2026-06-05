import { AuthProvider } from "@/components/AuthProvider";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Catholic Kids Crafts | Daily Mass & Catechism",
    template: "%s | Catholic Kids Crafts",
  },
  description:
    "Daily Catholic Mass readings in English, liturgical calendar, and kids catechism resources.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Catholic Kids Crafts",
    title: "Catholic Kids Crafts | Daily Mass & Catechism",
    description:
      "Daily Catholic Mass readings in English, liturgical calendar, and kids catechism resources.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Catholic Kids Crafts" }],
  },
  twitter: {
    card: "summary",
    title: "Catholic Kids Crafts",
    description:
      "Daily Catholic Mass readings in English, liturgical calendar, and kids catechism resources.",
    images: ["/logo.png"],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/logo-icon.png", type: "image/png", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <SiteJsonLd />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
