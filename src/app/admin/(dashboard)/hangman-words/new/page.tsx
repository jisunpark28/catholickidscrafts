import { PlayWordEditor } from "@/components/admin/PlayWordEditor";
import { HANGMAN_WORDS_ADMIN } from "@/lib/play-words-admin-config";
import Link from "next/link";

export default function NewHangmanWordPage() {
  return (
    <div>
      <Link href={HANGMAN_WORDS_ADMIN.adminListPath} className="text-sm font-semibold text-[var(--color-link)]">
        ← Hangman words
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Add hangman word</h1>
      <div className="mt-6">
        <PlayWordEditor config={HANGMAN_WORDS_ADMIN} />
      </div>
    </div>
  );
}
