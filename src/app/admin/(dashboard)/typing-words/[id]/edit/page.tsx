import Link from "next/link";
import { notFound } from "next/navigation";
import { TypingWordEditor } from "@/components/admin/TypingWordEditor";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function EditTypingWordPage({ params }: Props) {
  const { id } = await params;
  const item = await prisma.typingWord.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <Link href="/admin/typing-words" className="text-sm font-semibold text-[var(--color-link)]">
        ← Typing words
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit: {item.word}</h1>
      <div className="mt-6">
        <TypingWordEditor
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
