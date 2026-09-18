import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, HeroPhoto, heroLocation, type HeroComponentProps } from "./shared";

const TEAL_DEEP = "#0f766e";
const CYAN_MID = "#0e7490";
const NAVY_INK = "#082f49";

export function OceanHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative flex flex-col justify-between overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
    >
      {content.heroImageUrl ? <HeroPhoto src={content.heroImageUrl} position={content.heroImagePosition} /> : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${TEAL_DEEP} 0%, ${CYAN_MID} 45%, ${NAVY_INK} 100%)`,
          opacity: content.heroImageUrl ? 0.75 : 1,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-10 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: hexToRgba(brand, 0.3) }}
      />
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor="#ffffff"
        mutedColor={hexToRgba("#ffffff", 0.85)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        canvasElements={content.canvasElements.length > 0 ? content.canvasElements : undefined}
        layoutId="OCEAN"
      />
      <svg
        aria-hidden
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        className="relative z-10 h-10 w-full"
      >
        <path
          d="M0 20 C 60 0, 140 40, 200 20 S 340 0, 400 20 V40 H0 Z"
          fill="rgba(255,255,255,0.92)"
        />
      </svg>
    </header>
  );
}
