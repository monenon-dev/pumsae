import { GradientTemplate } from "@/components/landing/templates/GradientTemplate";
import { PhotoTemplate } from "@/components/landing/templates/PhotoTemplate";
import { SolidTemplate } from "@/components/landing/templates/SolidTemplate";
import { SplitTemplate } from "@/components/landing/templates/SplitTemplate";
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
  return <GradientTemplate content={content} preview={preview} />;
}
