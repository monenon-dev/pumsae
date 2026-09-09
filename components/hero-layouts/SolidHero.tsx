import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

export function SolidHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden"
      style={{ backgroundColor: brand }}
    >
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor={brandFg}
        mutedColor={hexToRgba(brandFg, 0.85)}
        buttonBg={brandFg}
        buttonFg={brand}
        headingFont={content.headingFont}
      />
    </header>
  );
}
