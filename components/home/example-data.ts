import { createPromoContent } from "@/lib/promo/layouts";
import {
  DEFAULT_HERO_IMAGE_POSITION,
  type DojangLandingContent,
  type HeroLayout,
} from "@/types/dojang";
import type { PromoTemplateType } from "@/types/promo-template";

// 실제 체육관이 아니라 설명용으로 지어낸 예시다(화면에도 "예시"로 표시).
export const EXAMPLE_NAME = "예시 태권도장";
export const EXAMPLE_SLUG = "example-taekwondo";

export const EXAMPLE_DOJANG: DojangLandingContent = {
  id: "example",
  name: EXAMPLE_NAME,
  slug: EXAMPLE_SLUG,
  description: "기본기부터 품새·겨루기까지, 아이 눈높이에 맞춰 차근차근 가르칩니다.",
  logoUrl: null,
  heroImageUrl: null,
  heroImagePosition: DEFAULT_HERO_IMAGE_POSITION,
  logoPosition: null,
  brandColor: "#b91c1c",
  customBgColor: null,
  customTextColor: null,
  sectionSpacing: "NORMAL",
  sectionText: {},
  canvasElements: [],
  heroLayout: "GRADIENT",
  headingFont: "PRETENDARD",
  region: "서울 강남구",
  address: null,
  phone: "02-000-0000",
  updatedAt: null,
};

/** 기능 카드에서 "여러 디자인 중 고르기"를 보여 줄 때 쓰는 디자인 4가지. */
export const EXAMPLE_LAYOUTS: HeroLayout[] = ["TRADITIONAL", "KIDS", "PREMIUM", "OCEAN"];

export const EXAMPLE_CARDS = (["AWARD", "BELT_UP", "RECRUIT"] as PromoTemplateType[]).map(
  (type) => createPromoContent(type, EXAMPLE_NAME),
);
