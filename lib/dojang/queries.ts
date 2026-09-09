import { cache } from "react";
import { getApiUrl } from "@/lib/api/types";
import {
  type DojangLandingContent,
  withNormalizedHeroLayout,
} from "@/types/dojang";

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
