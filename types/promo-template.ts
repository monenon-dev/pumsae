export const PROMO_TEMPLATE_TYPES = [
  "AWARD",
  "BELT_UP",
  "RECRUIT",
  "EVENT",
] as const;

export type PromoTemplateType = (typeof PROMO_TEMPLATE_TYPES)[number];

export const PROMO_FONT_WEIGHTS = [400, 500, 600, 700, 800] as const;

export type PromoFontWeight = (typeof PROMO_FONT_WEIGHTS)[number];

/** `promo_templates.content` jsonb 와 동일한 에디터 상태 */
export type PromoTemplateContent = {
  version: 1;
  type: PromoTemplateType;
  layoutId: string;
  title: string;
  subtitle: string;
  body: string;
  backgroundColor: string;
  titleFontSize: number;
  subtitleFontSize: number;
  bodyFontSize: number;
  titleFontWeight: PromoFontWeight;
  subtitleFontWeight: PromoFontWeight;
  bodyFontWeight: PromoFontWeight;
  dojangName: string;
  imageUrl: string | null;
};

export const PROMO_CARD_SIZE = 1080;

export const TITLE_FONT_SIZES = [56, 72, 88, 108] as const;
export const SUBTITLE_FONT_SIZES = [24, 32, 40, 48] as const;
export const BODY_FONT_SIZES = [22, 28, 32, 36] as const;

export const PROMO_TYPE_LABELS: Record<PromoTemplateType, string> = {
  AWARD: "대회 수상",
  BELT_UP: "띠 승급",
  RECRUIT: "신규 모집",
  EVENT: "행사",
};

export const FONT_WEIGHT_LABELS: Record<PromoFontWeight, string> = {
  400: "보통",
  500: "중간",
  600: "세미볼드",
  700: "볼드",
  800: "아주 굵게",
};
