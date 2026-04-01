import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AssetLens - スマート家計管理";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      {/* Logo area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            color: "white",
            fontWeight: "bold",
          }}
        >
          AL
        </div>
        <span
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          AssetLens
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "36px",
          color: "#94a3b8",
          textAlign: "center",
          maxWidth: "800px",
          lineHeight: 1.4,
        }}
      >
        資産管理を、もっとシンプルに。
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginTop: "48px",
        }}
      >
        <div
          style={{
            padding: "12px 24px",
            borderRadius: "999px",
            background: "rgba(59, 130, 246, 0.15)",
            color: "#60a5fa",
            fontSize: "18px",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          📊 直感的なグラフ
        </div>
        <div
          style={{
            padding: "12px 24px",
            borderRadius: "999px",
            background: "rgba(139, 92, 246, 0.15)",
            color: "#a78bfa",
            fontSize: "18px",
            border: "1px solid rgba(139, 92, 246, 0.3)",
          }}
        >
          🔐 パスキー認証
        </div>
        <div
          style={{
            padding: "12px 24px",
            borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.15)",
            color: "#34d399",
            fontSize: "18px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          ⚡ シンプル設計
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
