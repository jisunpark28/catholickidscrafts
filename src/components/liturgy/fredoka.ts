import { Fredoka } from "next/font/google";

/** Rounded display font for kid Q&A headings only. */
export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});
