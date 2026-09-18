import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

const PARCHMENT = "#EDEAE1";
const INK = "#2A2A28";

export function BadgeHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative m-3 flex flex-col justify-end overflow-hidden sm:m-5 ${heroMinHeightClass(content.sectionSpacing, "min-h-[74svh]")}`}
      style={{ backgroundColor: PARCHMENT }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 border sm:inset-4"
        style={{ borderColor: hexToRgba(INK, 0.25) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-10 h-28 w-28 rounded-full border-2 sm:right-14 sm:top-14 sm:h-36 sm:w-36"
        style={{ borderColor: hexToRgba(brand, 0.55) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-14 top-16 h-16 w-16 rounded-full border sm:right-20 sm:top-20 sm:h-24 sm:w-24"
        style={{ borderColor: hexToRgba(brand, 0.35) }}
      />
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor={INK}
        mutedColor={hexToRgba(INK, 0.6)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        canvasElements={content.canvasElements.length > 0 ? content.canvasElements : undefined}
        layoutId="BADGE"
      />
    </header>
  );
}
