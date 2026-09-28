import { cache } from "react";
import { getApiUrl } from "@/lib/api/types";
import { sanitizePromoContent } from "@/lib/promo/content";
import { createPromoContent } from "@/lib/promo/layouts";
import {
  type DojangLandingContent,
  withNormalizedHeroLayout,
} from "@/types/dojang";
import type { PromoTemplateContent, PublicNewsItem } from "@/types/promo-template";

export const getDojangBySlug = cache(async (
  slug: string,
): Promise<DojangLandingContent | null> => {
  const response = await fetch(
    `${getApiUrl()}/dojangs/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("체육관 페이지를 불러오지 못했습니다.");
  }

  return withNormalizedHeroLayout(
    (await response.json()) as DojangLandingContent,
  );
});

// 소식은 부가 정보라 불러오지 못해도 페이지는 그대로 보여준다.
export async function getDojangNews(
  slug: string,
  dojangName: string,
): Promise<PublicNewsItem[]> {
  try {
    const response = await fetch(
      `${getApiUrl()}/dojangs/${encodeURIComponent(slug)}/news`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return [];
    }
    const rows = (await response.json()) as PublicNewsItem[];
    return rows.flatMap((row) => {
      const stored = (row.content ?? {}) as Partial<PromoTemplateContent>;
      const content = sanitizePromoContent({
        ...createPromoContent(row.type, dojangName),
        ...stored,
        type: row.type,
        dojangName: stored.dojangName || dojangName,
      });
      return content ? [{ ...row, content }] : [];
    });
  } catch {
    return [];
  }
}
