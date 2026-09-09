import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

export function DynamicHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-[-8rem] h-[26rem] w-[26rem] rotate-[18deg]"
        style={{ backgroundColor: hexToRgba(brand, 0.9) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-10 h-[20rem] w-[20rem] rotate-[-12deg]"
        style={{ backgroundColor: hexToRgba(brand, 0.35) }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-[-6rem] h-[18rem] w-[18rem] rotate-[8deg] border-2"
        style={{ borderColor: hexToRgba(brand, 0.5) }}
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
        headingClassName="font-black uppercase tracking-tight"
      />
    </header>
  );
}
