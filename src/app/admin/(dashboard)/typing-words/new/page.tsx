import Link from "next/link";
import { TypingWordEditor } from "@/components/admin/TypingWordEditor";

export default function NewTypingWordPage() {
  return (
    <div>
      <Link href="/admin/typing-words" className="text-sm font-semibold text-[var(--color-link)]">
        ← Typing words
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New typing word</h1>
      <div className="mt-6">
        <TypingWordEditor />
      </div>
    </div>
  );
}
