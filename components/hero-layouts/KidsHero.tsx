import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { getReadableTextColor, hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

const INK = "#1C1C1C";

export function KidsHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <header
      className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FDE68A 0%, #86EFAC 50%, #93C5FD 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-white/40" />
      <div aria-hidden className="pointer-events-none absolute right-24 top-40 h-16 w-16 rounded-full bg-white/30" />
      <div aria-hidden className="pointer-events-none absolute left-[-3rem] bottom-24 h-52 w-52 rounded-full bg-white/30" />
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        textColor={INK}
        mutedColor={hexToRgba(INK, 0.7)}
        buttonBg={brand}
        buttonFg={brandFg}
        headingFont={content.headingFont}
        headingClassName="font-extrabold"
      />
    </header>
  );
}
