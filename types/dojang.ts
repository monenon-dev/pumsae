export const HERO_LAYOUTS = [
  "GRADIENT",
  "SOLID",
  "PHOTO_COVER",
  "TRADITIONAL",
  "DYNAMIC",
  "KIDS",
  "PREMIUM",
  "OCEAN",
  "MONO",
  "SPOTLIGHT",
  "BADGE",
  "CUSTOM",
  "CANVAS",
] as const;

export type HeroLayout = (typeof HERO_LAYOUTS)[number];

export const DEFAULT_HERO_LAYOUT: HeroLayout = "GRADIENT";

export const HERO_LAYOUT_LABELS: Record<HeroLayout, string> = {
  GRADIENT: "모던 그라데이션",
  SOLID: "미니멀 단색",
  PHOTO_COVER: "포토 매거진",
  TRADITIONAL: "전통 한지톤",
  DYNAMIC: "다이나믹 액션",
  KIDS: "키즈 프렌들리",
  PREMIUM: "프리미엄 다크",
  OCEAN: "오션 그라데이션",
  MONO: "모노크롬 에디토리얼",
  SPOTLIGHT: "스포트라이트",
  BADGE: "엠블럼 뱃지",
  CUSTOM: "완전 커스텀",
  CANVAS: "자유 캔버스",
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

export const SECTION_SPACINGS = ["COMPACT", "NORMAL", "SPACIOUS"] as const;

export type SectionSpacing = (typeof SECTION_SPACINGS)[number];

export const DEFAULT_SECTION_SPACING: SectionSpacing = "NORMAL";

export const SECTION_SPACING_LABELS: Record<SectionSpacing, string> = {
  COMPACT: "좁게",
  NORMAL: "기본",
  SPACIOUS: "넓게",
};

export function normalizeSectionSpacing(
  value: string | null | undefined,
): SectionSpacing {
  return SECTION_SPACINGS.includes(value as SectionSpacing)
    ? (value as SectionSpacing)
    : DEFAULT_SECTION_SPACING;
}

export const SECTION_TEXT_FIELDS = [
  { key: "class1Title", label: "첫 번째 반 이름", placeholder: "유치부" },
  {
    key: "class1Headline",
    label: "첫 번째 반 부제 (일부 디자인만 표시)",
    placeholder: "처음 만나는 태권도",
  },
  {
    key: "class1Desc",
    label: "첫 번째 반 설명",
    placeholder: "처음 태권도를 접하는 아이들을 위한 기초 수련.",
  },
  { key: "class2Title", label: "두 번째 반 이름", placeholder: "초등 · 중고등" },
  {
    key: "class2Headline",
    label: "두 번째 반 부제 (일부 디자인만 표시)",
    placeholder: "기본기부터 겨루기까지",
  },
  {
    key: "class2Desc",
    label: "두 번째 반 설명",
    placeholder: "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
  },
  { key: "class3Title", label: "세 번째 반 이름", placeholder: "성인반" },
  {
    key: "class3Headline",
    label: "세 번째 반 부제 (일부 디자인만 표시)",
    placeholder: "체력과 자기 관리",
  },
  {
    key: "class3Desc",
    label: "세 번째 반 설명",
    placeholder: "퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다.",
  },
  { key: "programEyebrow", label: "프로그램 섹션 라벨", placeholder: "Program" },
  { key: "ctaEyebrow", label: "체험 신청 섹션 라벨", placeholder: "Trial Class" },
  {
    key: "ctaTitle",
    label: "체험 신청 제목",
    placeholder: "우리 체육관, 먼저 체험해 보세요",
  },
  {
    key: "ctaDescription",
    label: "체험 신청 설명",
    placeholder: "방문 전 체험 수업을 신청하면 관장님이 일정과 안내를 도와드립니다.",
  },
  {
    key: "trialButtonText",
    label: "체험 신청 버튼 문구",
    placeholder: "체험 신청하기",
  },
] as const;

export type SectionTextKey = (typeof SECTION_TEXT_FIELDS)[number]["key"];

export const SECTION_TEXT_LAYOUT_FIELDS: Partial<
  Record<HeroLayout, readonly { key: string; label: string; placeholder: string }[]>
> = {
  GRADIENT: [
    {
      key: "gradientKidsEyebrow",
      label: "유소년 그룹 라벨",
      placeholder: "KIDS / TEENS",
    },
    {
      key: "gradientKidsGroupTitle",
      label: "유소년 그룹 제목",
      placeholder: "유치부 · 초중고",
    },
    {
      key: "gradientKidsIntro",
      label: "유소년 그룹 설명",
      placeholder: "아이부터 청소년까지, 또래와 함께 수련하는 반입니다.",
    },
    {
      key: "gradientAdultEyebrow",
      label: "성인 그룹 라벨",
      placeholder: "ADULT",
    },
    {
      key: "gradientAdultIntro",
      label: "성인 그룹 설명",
      placeholder: "체력과 자기 관리를 위한 성인 수련 자리입니다.",
    },
  ],
  KIDS: [
    {
      key: "kidsProgramTitle",
      label: "프로그램 섹션 제목",
      placeholder: "우리 반을 소개해요",
    },
  ],
  OCEAN: [
    {
      key: "oceanEyebrow",
      label: "프로그램 섹션 라벨",
      placeholder: "KIDS / TEENS / ADULT",
    },
    {
      key: "oceanProgramTitle",
      label: "프로그램 섹션 제목",
      placeholder: "연령별 맞춤 수업",
    },
    {
      key: "oceanProgramIntro",
      label: "프로그램 섹션 설명",
      placeholder: "아이부터 성인까지, 단계에 맞는 수련 프로그램을 운영합니다.",
    },
  ],
  SPOTLIGHT: [
    {
      key: "spotlightProgramTitle",
      label: "프로그램 섹션 제목",
      placeholder: "단계별 수련 프로그램",
    },
  ],
};

export type CanvasBreakpoint = "desktop" | "mobile";

export type CanvasElementPosition = {
  xPct: number;
  yPct: number;
  widthPct: number;
};

export type CanvasTextElement = {
  id: string;
  text: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  color: string;
  align: "left" | "center" | "right";
  desktop: CanvasElementPosition;
  mobile: CanvasElementPosition;
};

export function createCanvasElement(
  overrides: Partial<CanvasTextElement> = {},
): CanvasTextElement {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `el-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    text: "텍스트를 입력하세요",
    fontSize: 20,
    fontWeight: "normal",
    color: "#ffffff",
    align: "left",
    desktop: { xPct: 8, yPct: 40, widthPct: 50 },
    mobile: { xPct: 8, yPct: 40, widthPct: 84 },
    ...overrides,
  };
}

export type DojangLandingContent = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  brandColor: string | null;
  customBgColor: string | null;
  customTextColor: string | null;
  sectionSpacing: SectionSpacing;
  sectionText: Record<string, string>;
  canvasElements: CanvasTextElement[];
  heroLayout: HeroLayout;
  headingFont: HeadingFont;
  region: string | null;
  address: string | null;
  phone: string | null;
  updatedAt: string | null;
};

export function withNormalizedHeroLayout(
  content: Omit<
    DojangLandingContent,
    "heroLayout" | "headingFont" | "sectionSpacing" | "sectionText" | "canvasElements"
  > & {
    heroLayout?: string | null;
    headingFont?: string | null;
    sectionSpacing?: string | null;
    sectionText?: Record<string, string> | null;
    canvasElements?: CanvasTextElement[] | null;
  },
): DojangLandingContent {
  return {
    ...content,
    heroLayout: normalizeHeroLayout(content.heroLayout),
    headingFont: normalizeHeadingFont(content.headingFont),
    sectionSpacing: normalizeSectionSpacing(content.sectionSpacing),
    sectionText: content.sectionText ?? {},
    canvasElements: content.canvasElements ?? [],
  };
}

export const DEFAULT_BRAND_COLOR = "#b91c1c";

export const DEFAULT_CUSTOM_BG_COLOR = "#FFFFFF";
export const DEFAULT_CUSTOM_TEXT_COLOR = "#18181B";

export const CUSTOM_BG_COLOR_PRESETS = [
  { label: "화이트", value: "#FFFFFF" },
  { label: "아이보리", value: "#F5F0E4" },
  { label: "라이트 그레이", value: "#F4F4F5" },
  { label: "다크", value: "#18181B" },
] as const;

export const CUSTOM_TEXT_COLOR_PRESETS = [
  { label: "잉크 블랙", value: "#18181B" },
  { label: "화이트", value: "#FFFFFF" },
  { label: "그레이", value: "#52525B" },
] as const;
