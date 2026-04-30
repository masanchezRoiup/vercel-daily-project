// Next.js file-based OG image convention — exporting an ImageResponse from this file automatically
// serves it at /opengraph-image and wires it into the root <meta property="og:image"> tag.
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Vercel Daily";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 60%, #0a0a0a 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#ef4444",
            }}
          />
          <span
            style={{
              fontSize: 24,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            Vercel Daily
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            The front page
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa", maxWidth: 900 }}>
            A fictional news publication showcasing Next.js 16 patterns.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <span>Built with Next.js 16</span>
          <span>vercel-daily</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
