import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

const PAPER = "#FAFAF9";
const INK = "#18181b";

export function SolidHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className={`relative flex flex-col justify-end overflow-hidden border-b-4 ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
      style={{ backgroundColor: PAPER, borderColor: brand }}
    >
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor={INK}
        mutedColor={hexToRgba(INK, 0.55)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        canvasElements={content.canvasElements.length > 0 ? content.canvasElements : undefined}
        layoutId="SOLID"
      />
    </header>
  );
}
