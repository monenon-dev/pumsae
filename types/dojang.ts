export const HERO_LAYOUTS = [
  "GRADIENT",
  "SOLID",
  "PHOTO_COVER",
  "SPLIT",
] as const;

export type HeroLayout = (typeof HERO_LAYOUTS)[number];

export const DEFAULT_HERO_LAYOUT: HeroLayout = "GRADIENT";

export const HERO_LAYOUT_LABELS: Record<HeroLayout, string> = {
  GRADIENT: "그라데이션",
  SOLID: "단색",
  PHOTO_COVER: "사진 풀커버",
  SPLIT: "좌우 분할",
};

export function normalizeHeroLayout(
  value: string | null | undefined,
): HeroLayout {
  return HERO_LAYOUTS.includes(value as HeroLayout)
    ? (value as HeroLayout)
    : DEFAULT_HERO_LAYOUT;
}

export type DojangLandingContent = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  brandColor: string | null;
  heroLayout: HeroLayout;
  region: string | null;
  address: string | null;
  phone: string | null;
};

export function withNormalizedHeroLayout(
  content: Omit<DojangLandingContent, "heroLayout"> & {
    heroLayout?: string | null;
  },
): DojangLandingContent {
  return {
    ...content,
    heroLayout: normalizeHeroLayout(content.heroLayout),
  };
}

export const DEFAULT_BRAND_COLOR = "#b91c1c";

export const BRAND_COLOR_PRESETS = [
  { label: "태권 레드", value: "#b91c1c" },
  { label: "먹색", value: "#18181b" },
  { label: "남색", value: "#1e3a8a" },
  { label: "숲초록", value: "#166534" },
] as const;
