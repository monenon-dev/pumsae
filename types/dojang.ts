export const HERO_LAYOUTS = [
  "GRADIENT",
  "SOLID",
  "PHOTO_COVER",
  "SPLIT",
  "TRADITIONAL",
  "DYNAMIC",
  "KIDS",
  "PREMIUM",
] as const;

export type HeroLayout = (typeof HERO_LAYOUTS)[number];

export const DEFAULT_HERO_LAYOUT: HeroLayout = "GRADIENT";

export const HERO_LAYOUT_LABELS: Record<HeroLayout, string> = {
  GRADIENT: "모던 그라데이션",
  SOLID: "미니멀 단색",
  PHOTO_COVER: "포토 매거진",
  SPLIT: "좌우 분할",
  TRADITIONAL: "전통 한지톤",
  DYNAMIC: "다이나믹 액션",
  KIDS: "키즈 프렌들리",
  PREMIUM: "프리미엄 다크",
};

export function normalizeHeroLayout(
  value: string | null | undefined,
): HeroLayout {
  return HERO_LAYOUTS.includes(value as HeroLayout)
    ? (value as HeroLayout)
    : DEFAULT_HERO_LAYOUT;
}

export const HEADING_FONTS = [
  "PRETENDARD",
  "SONG_MYUNG",
  "BLACK_HAN_SANS",
  "GOWUN_BATANG",
  "GAEGU",
] as const;

export type HeadingFont = (typeof HEADING_FONTS)[number];

export const DEFAULT_HEADING_FONT: HeadingFont = "PRETENDARD";

export const HEADING_FONT_LABELS: Record<HeadingFont, string> = {
  PRETENDARD: "프리텐다드 (기본)",
  SONG_MYUNG: "송명체",
  BLACK_HAN_SANS: "검은고딕",
  GOWUN_BATANG: "고운바탕",
  GAEGU: "개구체",
};

export const HEADING_FONT_VARS: Record<HeadingFont, string> = {
  PRETENDARD: "var(--font-geist-sans)",
  SONG_MYUNG: "var(--font-song-myung)",
  BLACK_HAN_SANS: "var(--font-black-han-sans)",
  GOWUN_BATANG: "var(--font-gowun-batang)",
  GAEGU: "var(--font-gaegu)",
};

export function normalizeHeadingFont(
  value: string | null | undefined,
): HeadingFont {
  return HEADING_FONTS.includes(value as HeadingFont)
    ? (value as HeadingFont)
    : DEFAULT_HEADING_FONT;
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
  headingFont: HeadingFont;
  region: string | null;
  address: string | null;
  phone: string | null;
  updatedAt: string | null;
};

export function withNormalizedHeroLayout(
  content: Omit<DojangLandingContent, "heroLayout" | "headingFont"> & {
    heroLayout?: string | null;
    headingFont?: string | null;
  },
): DojangLandingContent {
  return {
    ...content,
    heroLayout: normalizeHeroLayout(content.heroLayout),
    headingFont: normalizeHeadingFont(content.headingFont),
  };
}

export const DEFAULT_BRAND_COLOR = "#b91c1c";

export const BRAND_COLOR_PRESETS = [
  { label: "태권 레드", value: "#b91c1c" },
  { label: "먹색", value: "#18181b" },
  { label: "남색", value: "#1e3a8a" },
  { label: "숲초록", value: "#166534" },
] as const;
