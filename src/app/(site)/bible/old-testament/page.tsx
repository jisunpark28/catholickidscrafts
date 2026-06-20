import { redirect } from "next/navigation";

/** Old Testament hub — opens Genesis directly. */
export default function OldTestamentPage() {
  redirect("/bible/genesis");
}
