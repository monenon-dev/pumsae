import type { PromoTemplateContent, PromoTemplateType } from "@/types/promo-template";

export type PromoLayoutPreset = {
  id: string;
  type: PromoTemplateType;
  name: string;
  backgroundColor: string;
  accentColor: string;
};

type TypeCopy = Pick<
  PromoTemplateContent,
  | "title"
  | "subtitle"
  | "body"
  | "titleFontSize"
  | "subtitleFontSize"
  | "bodyFontSize"
  | "titleFontWeight"
  | "subtitleFontWeight"
  | "bodyFontWeight"
>;

export const PROMO_TYPE_COPY: Record<PromoTemplateType, TypeCopy> = {
  AWARD: {
    title: "전국대회 금상",
    subtitle: "품새 초등부",
    body: "땀과 끈기로 이루어낸 우리 관원들의 수상을 진심으로 축하합니다.",
    titleFontSize: 88,
    subtitleFontSize: 32,
    bodyFontSize: 28,
    titleFontWeight: 800,
    subtitleFontWeight: 600,
    bodyFontWeight: 400,
  },
  BELT_UP: {
    title: "승급을 축하합니다",
    subtitle: "노란띠 → 초록띠",
    body: "꾸준한 수련으로 한 단계 성장한 관원들을 응원합니다.",
    titleFontSize: 88,
    subtitleFontSize: 32,
    bodyFontSize: 28,
    titleFontWeight: 800,
    subtitleFontWeight: 600,
    bodyFontWeight: 400,
  },
  RECRUIT: {
    title: "신입생 모집",
    subtitle: "유치부 · 초등부 · 청소년",
    body: "처음 태권도를 시작하는 아이들을 위한 체험 수업을 운영합니다.",
    titleFontSize: 108,
    subtitleFontSize: 32,
    bodyFontSize: 28,
    titleFontWeight: 800,
    subtitleFontWeight: 600,
    bodyFontWeight: 400,
  },
  EVENT: {
    title: "가을 공개 승급심사",
    subtitle: "10월 12일 일요일",
    body: "학부모님을 모시고 한 학기 수련 성과를 보여드립니다.",
    titleFontSize: 88,
    subtitleFontSize: 40,
    bodyFontSize: 28,
    titleFontWeight: 800,
    subtitleFontWeight: 600,
    bodyFontWeight: 400,
  },
};

export const PROMO_LAYOUTS: PromoLayoutPreset[] = [
  { id: "award-podium", type: "AWARD", name: "메달", backgroundColor: "#14120b", accentColor: "#d4af37" },
  { id: "award-ribbon", type: "AWARD", name: "리본", backgroundColor: "#7f1d1d", accentColor: "#f5d76e" },
  { id: "award-split", type: "AWARD", name: "세로띠", backgroundColor: "#faf6ee", accentColor: "#b91c1c" },
  { id: "award-stamp", type: "AWARD", name: "증서", backgroundColor: "#111827", accentColor: "#eab308" },
  { id: "belt-stripe", type: "BELT_UP", name: "띠 줄", backgroundColor: "#0c0a09", accentColor: "#dc2626" },
  { id: "belt-column", type: "BELT_UP", name: "세로 띠", backgroundColor: "#1c1917", accentColor: "#f59e0b" },
  { id: "belt-seal", type: "BELT_UP", name: "인장", backgroundColor: "#7f1d1d", accentColor: "#f8fafc" },
  { id: "belt-stage", type: "BELT_UP", name: "스포트라이트", backgroundColor: "#09090b", accentColor: "#ef4444" },
  { id: "recruit-poster", type: "RECRUIT", name: "포스터", backgroundColor: "#b91c1c", accentColor: "#ffffff" },
  { id: "recruit-info", type: "RECRUIT", name: "안내카드", backgroundColor: "#fff7ed", accentColor: "#9a3412" },
  { id: "recruit-slash", type: "RECRUIT", name: "사선", backgroundColor: "#18181b", accentColor: "#dc2626" },
  { id: "recruit-grid", type: "RECRUIT", name: "그리드", backgroundColor: "#fef2f2", accentColor: "#991b1b" },
  { id: "event-fest", type: "EVENT", name: "페스티벌", backgroundColor: "#1e3a8a", accentColor: "#fbbf24" },
  { id: "event-invite", type: "EVENT", name: "초대장", backgroundColor: "#fffbeb", accentColor: "#92400e" },
  { id: "event-bold", type: "EVENT", name: "빅타입", backgroundColor: "#0f172a", accentColor: "#f8fafc" },
  { id: "event-ticket", type: "EVENT", name: "티켓", backgroundColor: "#111827", accentColor: "#f59e0b" },
];

export function layoutsForType(type: PromoTemplateType): PromoLayoutPreset[] {
  return PROMO_LAYOUTS.filter((layout) => layout.type === type);
}

export function getLayoutPreset(layoutId: string): PromoLayoutPreset | undefined {
  return PROMO_LAYOUTS.find((layout) => layout.id === layoutId);
}

export function createPromoContent(
  type: PromoTemplateType,
  dojangName: string,
  layoutId?: string,
): PromoTemplateContent {
  const layouts = layoutsForType(type);
  const layout = layouts.find((item) => item.id === layoutId) ?? layouts[0];

  return {
    version: 1,
    type,
    layoutId: layout.id,
    backgroundColor: layout.backgroundColor,
    dojangName,
    ...PROMO_TYPE_COPY[type],
  };
}

export function applyLayout(
  content: PromoTemplateContent,
  layoutId: string,
): PromoTemplateContent {
  const layout = getLayoutPreset(layoutId);
  if (!layout || layout.type !== content.type) {
    return content;
  }

  return {
    ...content,
    layoutId: layout.id,
    backgroundColor: layout.backgroundColor,
  };
}
