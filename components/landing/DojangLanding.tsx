import { DynamicTemplate } from "@/components/landing/templates/DynamicTemplate";
import { GradientTemplate } from "@/components/landing/templates/GradientTemplate";
import { KidsTemplate } from "@/components/landing/templates/KidsTemplate";
import { PhotoTemplate } from "@/components/landing/templates/PhotoTemplate";
import { PremiumTemplate } from "@/components/landing/templates/PremiumTemplate";
import { SolidTemplate } from "@/components/landing/templates/SolidTemplate";
import { SplitTemplate } from "@/components/landing/templates/SplitTemplate";
import { TraditionalTemplate } from "@/components/landing/templates/TraditionalTemplate";
import { normalizeHeroLayout, type DojangLandingContent } from "@/types/dojang";

type DojangLandingProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

export function DojangLanding({
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
  if (layout === "SPLIT") {
    return <SplitTemplate content={content} preview={preview} />;
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
  return <GradientTemplate content={content} preview={preview} />;
}
