import {
  PIN_THEMES,
  pinTypeLabel,
  resolvePin,
  type PinTheme,
} from "@/lib/seo/pin-og";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const PIN_WIDTH = 1000;
const PIN_HEIGHT = 1500;

function PinCard({
  title,
  subtitle,
  badge,
  theme,
}: {
  title: string;
  subtitle: string;
  badge: string;
  theme: PinTheme;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.background,
        padding: "64px 56px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft decorative circles (CSS only — no external art). */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: theme.badge,
          opacity: 0.85,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: 999,
          backgroundColor: theme.badge,
          opacity: 0.7,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 420,
          right: 40,
          width: 120,
          height: 120,
          borderRadius: 999,
          border: `8px solid ${theme.accent}`,
          opacity: 0.35,
          display: "flex",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            color: theme.accent,
            letterSpacing: 0.5,
          }}
        >
          Catholic Kids Crafts
        </div>

        <div
          style={{
            marginTop: 28,
            alignSelf: "flex-start",
            display: "flex",
            backgroundColor: theme.badge,
            color: theme.ink,
            fontSize: 22,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            padding: "10px 18px",
            borderRadius: 999,
          }}
        >
          {badge}
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.panel,
            borderRadius: 32,
            padding: "48px 40px",
            border: `3px solid ${theme.accent}`,
            boxShadow: "0 18px 40px rgba(31, 41, 55, 0.08)",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: titleFontSize(title),
              fontWeight: 700,
              color: theme.ink,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              fontSize: 30,
              fontFamily: "system-ui, sans-serif",
              color: theme.muted,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            fontSize: 24,
            fontFamily: "system-ui, sans-serif",
            color: theme.muted,
          }}
        >
          catholickidscrafts.com
        </div>
      </div>
    </div>
  );
}

function titleFontSize(title: string): number {
  if (title.length > 70) return 42;
  if (title.length > 48) return 48;
  if (title.length > 32) return 56;
  return 64;
}

/** Vertical 1000×1500 Pinterest / OG pin. Validated type+slug only. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "";
  const slug = searchParams.get("slug") ?? "";
  const themeParam = searchParams.get("theme");
  const pin = resolvePin(type, slug, themeParam);
  if (!pin) {
    return new Response("Not found", { status: 404 });
  }

  const theme = PIN_THEMES[pin.theme];

  return new ImageResponse(
    (
      <PinCard
        title={pin.title}
        subtitle={pin.subtitle}
        badge={pinTypeLabel(pin.type)}
        theme={theme}
      />
    ),
    {
      width: PIN_WIDTH,
      height: PIN_HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
