import { normalizeHeroLayout } from "@/types/dojang";
import { DynamicHero } from "./DynamicHero";
import { GradientHero } from "./GradientHero";
import { KidsHero } from "./KidsHero";
import { PhotoCoverHero } from "./PhotoCoverHero";
import { PremiumHero } from "./PremiumHero";
import type { HeroComponentProps } from "./shared";
import { SolidHero } from "./SolidHero";
import { SplitHero } from "./SplitHero";
import { TraditionalHero } from "./TraditionalHero";

export function HeroLayoutSwitch({ content, preview = false }: HeroComponentProps) {
  const layout = normalizeHeroLayout(content.heroLayout);

  if (layout === "SOLID") return <SolidHero content={content} preview={preview} />;
  if (layout === "PHOTO_COVER") return <PhotoCoverHero content={content} preview={preview} />;
  if (layout === "SPLIT") return <SplitHero content={content} preview={preview} />;
  if (layout === "TRADITIONAL") return <TraditionalHero content={content} preview={preview} />;
  if (layout === "DYNAMIC") return <DynamicHero content={content} preview={preview} />;
  if (layout === "KIDS") return <KidsHero content={content} preview={preview} />;
  if (layout === "PREMIUM") return <PremiumHero content={content} preview={preview} />;
  return <GradientHero content={content} preview={preview} />;
}

export {
  DynamicHero,
  GradientHero,
  KidsHero,
  PhotoCoverHero,
  PremiumHero,
  SolidHero,
  SplitHero,
  TraditionalHero,
};
