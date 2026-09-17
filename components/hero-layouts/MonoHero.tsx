import { DEFAULT_BRAND_COLOR } from "@/types/dojang";
import { heroMinHeightClass, normalizeHexColor } from "@/lib/dojang/brand";
import { HeroCopy, heroLocation, type HeroComponentProps } from "./shared";

export function MonoHero({ content, preview = false }: HeroComponentProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);

  return (
    <header
      className={`relative m-3 flex flex-col justify-end overflow-hidden border-2 border-zinc-900 bg-white sm:m-5 ${heroMinHeightClass(content.sectionSpacing, "min-h-[74svh]")}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(#18181b 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
      <div aria-hidden className="absolute inset-x-5 top-5 h-px bg-zinc-900 sm:inset-x-8" />
      <HeroCopy
        content={content}
        location={heroLocation(content)}
        trialHref={preview ? undefined : "#trial"}
        editable={preview}
        textColor="#18181b"
        mutedColor="rgba(24,24,27,0.6)"
        buttonBg="#18181b"
        buttonFg="#ffffff"
        headingFont={content.headingFont}
        headingClassName="uppercase"
      />
      <div aria-hidden className="absolute bottom-5 right-5 h-2 w-2 rounded-full sm:right-8" style={{ backgroundColor: brand }} />
    </header>
  );
}
