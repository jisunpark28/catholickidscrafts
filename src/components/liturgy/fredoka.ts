import localFont from "next/font/local";

/** Rounded display font for kid Q&A headings only. */
export const fredoka = localFont({
  src: "../../assets/fonts/fredoka-variable.ttf",
  weight: "500 700",
  variable: "--font-fredoka",
  display: "swap",
});
