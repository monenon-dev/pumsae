import { ImageResponse } from "next/og";
import { getDojangBySlug } from "@/lib/dojang/queries";
import { dojangSeo } from "@/lib/dojang/seo";
import {
  getReadableTextColor,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { DEFAULT_BRAND_COLOR } from "@/types/dojang";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const alt = "PUMSAE 체육관";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@5.2.8/korean-700-normal.woff";

async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(FONT_URL, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!response.ok) {
      return null;
    }
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

async function loadLogoSrc(url: string | null): Promise<string | null> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/") || contentType.includes("svg")) {
      return null;
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:${contentType};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const dojang = await getDojangBySlug(params.slug);
  const [fontData, logoSrc] = await Promise.all([
    loadKoreanFont(),
    loadLogoSrc(dojang?.logoUrl ?? null),
  ]);

  const name = dojang?.name?.trim() || "PUMSAE";
  const brand = normalizeHexColor(dojang?.brandColor, DEFAULT_BRAND_COLOR);
  const fg = getReadableTextColor(brand);
  const muted = hexToRgba(fg, 0.78);
  const initial = Array.from(name)[0] ?? "P";
  const place = [dojang?.region, dojang?.address].filter(Boolean).join(" ");
  const summary = dojang
    ? dojangSeo(dojang).description.slice(0, 90)
    : "지역 태권도장 홍보와 체험 신청";

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
          backgroundColor: brand,
          color: fg,
          fontFamily: fontData ? "Noto Sans KR" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.28em",
              opacity: 0.8,
            }}
          >
            PUMSAE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              opacity: 0.75,
            }}
          >
            체험 수업
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={168}
              height={168}
              style={{
                width: 168,
                height: 168,
                borderRadius: 84,
                objectFit: "cover",
                border: `6px solid ${fg}`,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 168,
                height: 168,
                borderRadius: 84,
                backgroundColor: hexToRgba(fg, 0.14),
                border: `6px solid ${hexToRgba(fg, 0.35)}`,
                fontSize: 72,
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 40,
              maxWidth: 820,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
              }}
            >
              {name}
            </div>
            {place ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  fontSize: 28,
                  color: muted,
                }}
              >
                {place}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  fontSize: 28,
                  color: muted,
                }}
              >
                {summary}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Noto Sans KR",
              data: fontData,
              weight: 700,
              style: "normal",
            },
          ]
        : [],
    },
  );
}
