import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Catholic Kids Crafts | Catechism & Sunday School Resources",
    template: "%s | Catholic Kids Crafts",
  },
  description:
    "Free Catholic kids catechism lesson plans, crafts, and worksheets for Sunday school teachers and homeschool parents.",
  openGraph: {
    title: "Catholic Kids Crafts",
    description:
      "Your guide to Catholic kids catechism—lesson plans, crafts, and seasonal resources.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
