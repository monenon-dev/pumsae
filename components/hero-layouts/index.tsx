import { normalizeHeroLayout } from "@/types/dojang";
import { BadgeHero } from "./BadgeHero";
import { CanvasHero } from "./CanvasHero";
import { CustomHero } from "./CustomHero";
import { DynamicHero } from "./DynamicHero";
import { GradientHero } from "./GradientHero";
import { KidsHero } from "./KidsHero";
import { MonoHero } from "./MonoHero";
import { OceanHero } from "./OceanHero";
import { PhotoCoverHero } from "./PhotoCoverHero";
import { PremiumHero } from "./PremiumHero";
import type { HeroComponentProps } from "./shared";
import { SolidHero } from "./SolidHero";
import { SpotlightHero } from "./SpotlightHero";
import { TraditionalHero } from "./TraditionalHero";

export function HeroLayoutSwitch({ content, preview = false }: HeroComponentProps) {
  const layout = normalizeHeroLayout(content.heroLayout);

  if (layout === "SOLID") return <SolidHero content={content} preview={preview} />;
  if (layout === "PHOTO_COVER") return <PhotoCoverHero content={content} preview={preview} />;
  if (layout === "TRADITIONAL") return <TraditionalHero content={content} preview={preview} />;
  if (layout === "DYNAMIC") return <DynamicHero content={content} preview={preview} />;
  if (layout === "KIDS") return <KidsHero content={content} preview={preview} />;
  if (layout === "PREMIUM") return <PremiumHero content={content} preview={preview} />;
  if (layout === "OCEAN") return <OceanHero content={content} preview={preview} />;
  if (layout === "MONO") return <MonoHero content={content} preview={preview} />;
  if (layout === "SPOTLIGHT") return <SpotlightHero content={content} preview={preview} />;
  if (layout === "BADGE") return <BadgeHero content={content} preview={preview} />;
  if (layout === "CUSTOM") return <CustomHero content={content} preview={preview} />;
  if (layout === "CANVAS") return <CanvasHero content={content} preview={preview} />;
  return <GradientHero content={content} preview={preview} />;
}

export {
  BadgeHero,
  CanvasHero,
  CustomHero,
  DynamicHero,
  GradientHero,
  KidsHero,
  MonoHero,
  OceanHero,
  PhotoCoverHero,
  PremiumHero,
  SolidHero,
  SpotlightHero,
  TraditionalHero,
};
