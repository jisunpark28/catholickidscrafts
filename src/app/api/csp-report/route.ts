import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FIELD = 300;
const MAX_REPORTS = 20;

function clip(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  return value.length > MAX_FIELD ? `${value.slice(0, MAX_FIELD)}…` : value;
}

function summarize(entry: Record<string, unknown>): Record<string, string | undefined> {
  const body =
    entry.body && typeof entry.body === "object"
      ? (entry.body as Record<string, unknown>)
      : entry;
  const report =
    body["csp-report"] && typeof body["csp-report"] === "object"
      ? (body["csp-report"] as Record<string, unknown>)
      : body;

  return {
    documentUri: clip(report["document-uri"] ?? report.documentURI ?? entry.url),
    blockedUri: clip(report["blocked-uri"] ?? report.blockedURL),
    violatedDirective: clip(
      report["violated-directive"] ?? report["effective-directive"] ?? report.effectiveDirective,
    ),
    disposition: clip(report.disposition),
  };
}

function collectReports(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object";
    });
  }
  if (payload && typeof payload === "object") {
    return [payload as Record<string, unknown>];
  }
  return [];
}

/** Browser CSP Report-Only endpoint. Logs a short summary; does not enforce. */
export async function POST(request: Request) {
  let payload: unknown = null;
  try {
    const text = await request.text();
    if (text.trim()) payload = JSON.parse(text) as unknown;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const summaries = collectReports(payload).slice(0, MAX_REPORTS).map(summarize);
  if (summaries.length > 0) {
    console.info("[csp-report]", JSON.stringify(summaries));
  }

  return new NextResponse(null, { status: 204 });
}
