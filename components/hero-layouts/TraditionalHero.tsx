import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

const IVORY = "#F5F0E4";
const INK = "#1C1C1C";

export function TraditionalHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden"
      style={{ backgroundColor: IVORY }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full"
        style={{ border: `1px solid ${hexToRgba(INK, 0.12)}` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-[20rem] w-[20rem] rounded-full"
        style={{ border: `1px solid ${hexToRgba(INK, 0.1)}` }}
      />
      <p
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-0 select-none text-[18rem] font-black leading-none"
        style={{ color: hexToRgba(INK, 0.05) }}
      >
        道
      </p>
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor={INK}
        mutedColor={hexToRgba(INK, 0.65)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        headingClassName="font-normal tracking-wide"
      />
    </header>
  );
}
