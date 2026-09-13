import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Medix - Modern Digital Healthcare & Telemedicine Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#083344",
          padding: "64px 72px",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            backgroundColor: "#0B7285",
            opacity: 0.35,
            filter: "blur(90px)",
          }}
        />

        {/* Top Header: Brand & Security Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#0B7285",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: "bold",
                color: "#FFFFFF",
              }}
            >
              +
            </div>
            <span
              style={{
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
              }}
            >
              Medix<span style={{ color: "#14B8A6" }}>.</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(11, 114, 133, 0.35)",
              border: "1px solid rgba(20, 184, 166, 0.4)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#5EEAD4",
            }}
          >
            Verified Clinical Network • HIPAA Aligned
          </div>
        </div>

        {/* Central Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "920px",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#FFFFFF",
            }}
          >
            Modern Healthcare,{" "}
            <span style={{ color: "#2DD4BF" }}>Seamlessly Connected</span>
          </h1>
          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "#94A3B8",
              margin: 0,
            }}
          >
            Connect with board-certified physicians, schedule video consultations,
            and experience proactive care guided by intelligent clinical assistance.
          </p>
        </div>

        {/* Bottom Trust Indicators */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "28px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            fontSize: "18px",
            color: "#CBD5E1",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <span>⚡ Instant Telemedicine</span>
            <span>🔒 Encrypted Medical Records</span>
            <span>💳 Secure Stripe Checkout</span>
          </div>
          <span style={{ color: "#2DD4BF", fontWeight: 700 }}>medix.health</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
