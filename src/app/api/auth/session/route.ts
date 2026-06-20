import { getHeaderSession } from "@/lib/get-header-session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getHeaderSession();
  return NextResponse.json(session);
}
