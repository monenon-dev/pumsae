import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { GradientLayer, HeroCopy, HeroPhoto, heroLocation, type HeroComponentProps } from "./shared";

export function PhotoCoverHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-zinc-900">
      {content.heroImageUrl ? (
        <HeroPhoto src={content.heroImageUrl} />
      ) : (
        <GradientLayer brand={brand} />
      )}
      <div className="absolute inset-0 bg-black/55" />
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
