import { BadgeTemplate } from "@/components/landing/templates/BadgeTemplate";
import { CanvasTemplate } from "@/components/landing/templates/CanvasTemplate";
import { DynamicTemplate } from "@/components/landing/templates/DynamicTemplate";
import { GradientTemplate } from "@/components/landing/templates/GradientTemplate";
import { KidsTemplate } from "@/components/landing/templates/KidsTemplate";
import { MonoTemplate } from "@/components/landing/templates/MonoTemplate";
import { OceanTemplate } from "@/components/landing/templates/OceanTemplate";
import { PhotoTemplate } from "@/components/landing/templates/PhotoTemplate";
import { PremiumTemplate } from "@/components/landing/templates/PremiumTemplate";
import { SolidTemplate } from "@/components/landing/templates/SolidTemplate";
import { SpotlightTemplate } from "@/components/landing/templates/SpotlightTemplate";
import { TraditionalTemplate } from "@/components/landing/templates/TraditionalTemplate";
import { HeroLogo } from "@/components/hero-layouts/shared";
import { normalizeHexColor } from "@/lib/dojang/brand";
import {
  DEFAULT_BRAND_COLOR,
  normalizeHeroLayout,
  type DojangLandingContent,
} from "@/types/dojang";

type DojangLandingProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

function LandingTemplate({
  content,
  preview = false,
}: DojangLandingProps) {
  const layout = normalizeHeroLayout(content.heroLayout);

  if (layout === "SOLID") {
    return <SolidTemplate content={content} preview={preview} />;
  }
  if (layout === "PHOTO_COVER") {
    return <PhotoTemplate content={content} preview={preview} />;
  }
  if (layout === "TRADITIONAL") {
    return <TraditionalTemplate content={content} preview={preview} />;
  }
  if (layout === "DYNAMIC") {
    return <DynamicTemplate content={content} preview={preview} />;
  }
  if (layout === "KIDS") {
    return <KidsTemplate content={content} preview={preview} />;
  }
  if (layout === "PREMIUM") {
    return <PremiumTemplate content={content} preview={preview} />;
  }
  if (layout === "OCEAN") {
    return <OceanTemplate content={content} preview={preview} />;
  }
  if (layout === "MONO") {
    return <MonoTemplate content={content} preview={preview} />;
  }
  if (layout === "SPOTLIGHT") {
    return <SpotlightTemplate content={content} preview={preview} />;
  }
  if (layout === "BADGE") {
    return <BadgeTemplate content={content} preview={preview} />;
  }
  if (layout === "CANVAS") {
    return <CanvasTemplate content={content} preview={preview} />;
  }
  return <GradientTemplate content={content} preview={preview} />;
}

export function DojangLanding({
  content,
  preview = false,
}: DojangLandingProps) {
  return (
    <div className="relative" data-landing-root="">
      <LandingTemplate content={content} preview={preview} />
      {content.logoUrl && content.logoPosition ? (
        <HeroLogo
          src={content.logoUrl}
          alt={`${content.name} 로고`}
          borderColor={normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR)}
          position={content.logoPosition}
        />
      ) : null}
    </div>
  );
}
