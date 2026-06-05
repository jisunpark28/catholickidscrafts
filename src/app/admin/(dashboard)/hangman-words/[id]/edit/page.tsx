import { PlayWordEditor } from "@/components/admin/PlayWordEditor";
import { HANGMAN_WORDS_ADMIN } from "@/lib/play-words-admin-config";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditHangmanWordPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.hangmanWord.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link href={HANGMAN_WORDS_ADMIN.adminListPath} className="text-sm font-semibold text-[var(--color-link)]">
        ← Hangman words
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit hangman word</h1>
      <div className="mt-6">
        <PlayWordEditor
          config={HANGMAN_WORDS_ADMIN}
          initial={{
            id: item.id,
            word: item.word,
            hint: item.hint,
            sortOrder: item.sortOrder,
            published: item.published,
          }}
        />
      </div>
    </div>
  );
}
