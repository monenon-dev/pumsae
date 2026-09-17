import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_CUSTOM_BG_COLOR,
  DEFAULT_CUSTOM_TEXT_COLOR,
} from "@/types/dojang";
import {
  getReadableTextColor,
  heroMinHeightClass,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

export function CustomHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const bg = normalizeHexColor(content.customBgColor, DEFAULT_CUSTOM_BG_COLOR);
  const ink = normalizeHexColor(content.customTextColor, DEFAULT_CUSTOM_TEXT_COLOR);

  return (
    <header
      className={`relative flex flex-col justify-end overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
      style={{ backgroundColor: bg }}
    >
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        editable={preview}
        textColor={ink}
        mutedColor={hexToRgba(ink, 0.6)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
      />
    </header>
  );
}
