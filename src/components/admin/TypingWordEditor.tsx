"use client";

import { PlayWordEditor, type PlayWordFormData } from "@/components/admin/PlayWordEditor";
import { TYPING_WORDS_ADMIN } from "@/lib/play-words-admin-config";

export type TypingWordFormData = PlayWordFormData;

type Props = { initial?: TypingWordFormData };

export function TypingWordEditor({ initial }: Props) {
  return <PlayWordEditor config={TYPING_WORDS_ADMIN} initial={initial} />;
}
