import { ImageResponse } from "next/og";

export const alt = "Procurelio — Tenders, made clear.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ background: "#f5f1e8", color: "#20241f", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "68px 76px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 62, height: 62, position: "relative", display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "20px 20px 20px 4px", background: "#20241f" }} />
            <div style={{ position: "absolute", width: 20, height: 14, left: 22, top: 17, borderRadius: 7, background: "#f5f1e8" }} />
            <div style={{ position: "absolute", width: 22, height: 22, left: 22, bottom: 6, background: "#b56d50", clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
          </div>
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-1.5px" }}>Procurelio</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 88, letterSpacing: "-4px", lineHeight: 1 }}>Tenders, made clear.</span>
          <span style={{ color: "#627159", fontFamily: "Georgia, serif", fontSize: 29, marginTop: 26 }}>Evidence-led procurement for Germany and Austria</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#666b64", fontSize: 18 }}>
          <span>Discover</span><span style={{ color: "#b56d50" }}>•</span><span>Qualify</span><span style={{ color: "#b56d50" }}>•</span><span>Participate with confidence</span>
        </div>
      </div>
    ),
    size,
  );
}
