import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, HeroPhoto, heroLocation, type HeroComponentProps } from "./shared";

const NEAR_BLACK = "#0B0B0C";
const GOLD = "#C9A15A";

export function PremiumHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative flex flex-col justify-end overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
    >
      {content.heroImageUrl ? <HeroPhoto src={content.heroImageUrl} position={content.heroImagePosition} /> : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: NEAR_BLACK, opacity: content.heroImageUrl ? 0.68 : 1 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-5 top-10 h-px w-16 sm:left-8"
        style={{ backgroundColor: hexToRgba(GOLD, 0.7) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-5 h-px w-24 sm:right-8"
        style={{ backgroundColor: hexToRgba(GOLD, 0.4) }}
      />
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor="#ffffff"
        mutedColor={hexToRgba(GOLD, 0.85)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        canvasElements={content.canvasElements.length > 0 ? content.canvasElements : undefined}
        layoutId="PREMIUM"
        headingClassName="font-light uppercase tracking-[0.15em]"
      />
    </header>
  );
}
