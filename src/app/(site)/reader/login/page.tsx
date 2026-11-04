import { redirect } from "next/navigation";

/** The Access ID sign-in page is replaced by the Kid Code + PIN picker (Mom's Bible PR-2). */
export default function ReaderLoginPage() {
  redirect("/kids");
}
