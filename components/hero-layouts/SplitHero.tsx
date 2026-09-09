import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, HeroPhoto, heroLocation, type HeroComponentProps } from "./shared";

export function SplitHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header className="grid min-h-[78svh] overflow-hidden bg-zinc-900 md:grid-cols-2">
      <div className="flex min-h-[52svh] flex-col justify-end" style={{ backgroundColor: brand }}>
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
      </div>
      <div className="relative min-h-[42vh] bg-zinc-800 md:min-h-full">
        {content.heroImageUrl ? (
          <HeroPhoto src={content.heroImageUrl} />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${hexToRgba(brand, 0.45)} 0%, #27272a 100%)`,
            }}
          />
        )}
      </div>
    </header>
  );
}
