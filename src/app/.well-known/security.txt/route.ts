import { buildSecurityTxt } from "@/lib/security-txt";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(buildSecurityTxt(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
