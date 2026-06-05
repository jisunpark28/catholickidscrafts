import { getPublishedHangmanWords } from "@/lib/hangman-words";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await getPublishedHangmanWords();
    return NextResponse.json(items);
  } catch (e) {
    console.error("hangman-words:", e);
    return NextResponse.json([], { status: 200 });
  }
}
