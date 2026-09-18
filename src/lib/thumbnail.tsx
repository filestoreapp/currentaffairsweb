import { ImageResponse } from "next/og";

export const THUMBNAIL_WIDTH = 1200;
export const THUMBNAIL_HEIGHT = 630;

// A handful of on-brand gradient pairs (indigo/violet family, matching the
// site's existing Tailwind theme). The gradient used for a given post is
// picked deterministically from its title, so the same post always gets the
// same background instead of a random one on every regeneration.
const GRADIENTS: [string, string][] = [
  ["#3730a3", "#6366f1"],
  ["#1e1b4b", "#4f46e5"],
  ["#312e81", "#7c3aed"],
  ["#1e3a8a", "#3b82f6"],
  ["#4c1d95", "#9333ea"],
  ["#0f172a", "#4338ca"],
];

function pickGradient(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export interface ThumbnailInput {
  title: string;
  category?: string | null;
}

/**
 * Builds the actual visual (as a JSX tree consumed by `next/og`'s
 * ImageResponse / satori) for a post thumbnail: brand mark, category badge,
 * title, and a subtle decorative background. Shared between the persisted
 * generator (`generateThumbnailBuffer`) and the live-preview API route so
 * both always render identically.
 */
function ThumbnailImage({ title, category }: ThumbnailInput) {
  const [from, to] = pickGradient(title || "psc");
  const safeTitle = title.length > 140 ? title.slice(0, 137) + "…" : title;
  const fontSize = safeTitle.length > 80 ? 42 : safeTitle.length > 50 ? 50 : 60;

  return (
    <div
      style={{
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 70px",
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -90,
          right: -90,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -110,
          left: -70,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "rgba(255,255,255,0.16)",
            color: "white",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          PSC
        </div>
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.85)",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Kerala PSC Current Affairs
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {category ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              padding: "8px 22px",
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            color: "white",
            fontSize,
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: -1,
          }}
        >
          {safeTitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          color: "rgba(255,255,255,0.6)",
          fontSize: 19,
          fontWeight: 500,
        }}
      >
        Daily updates for PSC aspirants
      </div>
    </div>
  );
}

/**
 * Renders a branded thumbnail and returns it as a PNG ArrayBuffer, ready to
 * upload to Supabase Storage. Safe to call from server actions (Node.js
 * runtime), not just edge route handlers.
 */
export async function generateThumbnailBuffer(
  input: ThumbnailInput
): Promise<ArrayBuffer> {
  const image = new ImageResponse(<ThumbnailImage {...input} />, {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
  });
  return image.arrayBuffer();
}

export { ThumbnailImage };
