import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

const STAGE_INK = "#050507";

export function SpotlightHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative flex flex-col justify-end overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
      style={{ backgroundColor: STAGE_INK }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        style={{ backgroundColor: hexToRgba(brand, 0.4) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, transparent 0%, ${hexToRgba(STAGE_INK, 0.85)} 70%)`,
        }}
      />
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        editable={preview}
        textColor="#ffffff"
        mutedColor={hexToRgba("#ffffff", 0.75)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        headingClassName="font-extrabold"
      />
    </header>
  );
}
