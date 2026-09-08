import { normalizeHexColor } from "@/lib/dojang/brand";
import {
  BODY_FONT_SIZES,
  PROMO_FONT_WEIGHTS,
  PROMO_TEMPLATE_TYPES,
  SUBTITLE_FONT_SIZES,
  TITLE_FONT_SIZES,
  type PromoFontWeight,
  type PromoTemplateContent,
  type PromoTemplateType,
} from "@/types/promo-template";

function isPromoType(value: string): value is PromoTemplateType {
  return (PROMO_TEMPLATE_TYPES as readonly string[]).includes(value);
}

function isFontWeight(value: number): value is PromoFontWeight {
  return (PROMO_FONT_WEIGHTS as readonly number[]).includes(value);
}

function clampSize(value: number, allowed: readonly number[]): number {
  if (allowed.includes(value)) {
    return value;
  }

  return allowed.reduce((closest, size) =>
    Math.abs(size - value) < Math.abs(closest - value) ? size : closest,
  );
}

export function sanitizePromoContent(
  input: PromoTemplateContent,
): PromoTemplateContent | null {
  if (!isPromoType(input.type) || !input.layoutId.trim()) {
    return null;
  }

  const title = input.title.trim();
  if (!title) {
    return null;
  }

  return {
    version: 1,
    type: input.type,
    layoutId: input.layoutId.trim(),
    title,
    subtitle: input.subtitle.trim(),
    body: input.body.trim(),
    backgroundColor: normalizeHexColor(input.backgroundColor, "#18181b"),
    titleFontSize: clampSize(input.titleFontSize, TITLE_FONT_SIZES),
    subtitleFontSize: clampSize(input.subtitleFontSize, SUBTITLE_FONT_SIZES),
    bodyFontSize: clampSize(input.bodyFontSize, BODY_FONT_SIZES),
    titleFontWeight: isFontWeight(input.titleFontWeight)
      ? input.titleFontWeight
      : 800,
    subtitleFontWeight: isFontWeight(input.subtitleFontWeight)
      ? input.subtitleFontWeight
      : 600,
    bodyFontWeight: isFontWeight(input.bodyFontWeight)
      ? input.bodyFontWeight
      : 400,
    dojangName: input.dojangName.trim(),
  };
}
