import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, HeroPhoto, heroLocation, type HeroComponentProps } from "./shared";

const ESPRESSO_DEEP = "#2b1a10";
const ESPRESSO_INK = "#160f0a";

export function PhotoCoverHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative flex flex-col justify-end overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
    >
      {content.heroImageUrl ? (
        <HeroPhoto src={content.heroImageUrl} />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${ESPRESSO_DEEP} 0%, ${ESPRESSO_INK} 72%)`,
          }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${hexToRgba(ESPRESSO_INK, 0.92)} 0%, ${hexToRgba(ESPRESSO_INK, 0.35)} 55%, ${hexToRgba(ESPRESSO_INK, 0.15)} 100%)`,
        }}
      />
      <p
        aria-hidden
        className="absolute left-5 top-6 z-10 text-xs font-semibold uppercase tracking-[0.3em] sm:left-8 sm:top-8"
        style={{ color: brand }}
      >
        Feature Story
      </p>
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
        layoutId="PHOTO_COVER"
      />
    </header>
  );
}
