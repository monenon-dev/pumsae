import { cache } from "react";
import { getApiUrl } from "@/lib/api/types";
import type { DojangLandingContent } from "@/types/dojang";

export const getDojangBySlug = cache(async (
  slug: string,
): Promise<DojangLandingContent | null> => {
  try {
    const response = await fetch(
      `${getApiUrl()}/dojangs/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );

    if (response.status === 404 || !response.ok) {
      return null;
    }

    return (await response.json()) as DojangLandingContent;
  } catch {
    return null;
  }
});
