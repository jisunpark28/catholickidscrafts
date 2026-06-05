"use client";

import { PlayWordsManager, type PlayWordRow } from "@/components/admin/PlayWordsManager";
import { TYPING_WORDS_ADMIN } from "@/lib/play-words-admin-config";

export type TypingWordRow = PlayWordRow;

type Props = { initialItems: TypingWordRow[] };

export function TypingWordsManager({ initialItems }: Props) {
  return <PlayWordsManager initialItems={initialItems} config={TYPING_WORDS_ADMIN} />;
}
