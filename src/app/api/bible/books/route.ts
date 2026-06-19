import { booksByTestament, fetchBibleBooks } from "@/lib/bible/latinprayer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testament = searchParams.get("testament");
  try {
    const books = await fetchBibleBooks();
    const filtered =
      testament === "OT" || testament === "NT"
        ? booksByTestament(books, testament)
        : books;
    return NextResponse.json(filtered, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (e) {
    console.error("bible books", e);
    return NextResponse.json({ error: "Failed to load books" }, { status: 502 });
  }
}
