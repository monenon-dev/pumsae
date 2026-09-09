import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { GradientLayer, HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

export function GradientHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-zinc-900">
      <GradientLayer brand={brand} />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${hexToRgba("#000000", 0.78)} 0%, ${hexToRgba(brand, 0.32)} 48%, ${hexToRgba("#000000", 0.18)} 100%)`,
        }}
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
      />
    </header>
  );
}
