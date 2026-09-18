import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, HeroPhoto, heroLocation, type HeroComponentProps } from "./shared";

const INDIGO_DEEP = "#1e1b4b";
const INDIGO_MID = "#4c1d95";
const INK = "#0b0f1a";

export function GradientHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative flex flex-col justify-center overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
    >
      {content.heroImageUrl ? <HeroPhoto src={content.heroImageUrl} position={content.heroImagePosition} /> : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${INDIGO_DEEP} 0%, ${INDIGO_MID} 48%, ${INK} 100%)`,
          opacity: content.heroImageUrl ? 0.78 : 1,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ backgroundColor: hexToRgba(brand, 0.35) }}
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
        layoutId="GRADIENT"
      />
    </header>
  );
}
