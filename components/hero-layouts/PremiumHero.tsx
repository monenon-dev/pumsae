import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

const NEAR_BLACK = "#0B0B0C";
const GOLD = "#C9A15A";

export function PremiumHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden"
      style={{ backgroundColor: NEAR_BLACK }}
    >
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
        headingClassName="font-light uppercase tracking-[0.15em]"
      />
    </header>
  );
}
