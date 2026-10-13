import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} – Book squashbane i ${site.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: 80,
          background: "#111827",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: "#60a5fa" }}>
          {site.legalName}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 900, letterSpacing: -4, lineHeight: 1, textTransform: "uppercase" }}>
            Book squashbane
          </div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 28, color: "#d1d5db" }}>
            {site.street}, {site.postalCode} {site.city}
          </div>
        </div>
      </div>
    ),
    size
  );
}
