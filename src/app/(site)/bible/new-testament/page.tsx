import { redirect } from "next/navigation";

/** New Testament hub — opens Matthew directly. */
export default function NewTestamentPage() {
  redirect("/bible/matthew");
}
