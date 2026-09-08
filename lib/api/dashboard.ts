"use client";

import { apiJson } from "@/lib/api/client";
import type { DojangLandingContent } from "@/types/dojang";
import type { PromoTemplateContent } from "@/types/promo-template";
import { PROMO_TYPE_LABELS, type PromoTemplateType } from "@/types/promo-template";

export async function fetchMyDojang(): Promise<DojangLandingContent> {
  return apiJson<DojangLandingContent>("/dashboard/dojang");
}

export async function updateMyDojang(
  input: Partial<{
    name: string;
    description: string | null;
    logoUrl: string | null;
    heroImageUrl: string | null;
    brandColor: string | null;
  }>,
): Promise<DojangLandingContent> {
  return apiJson<DojangLandingContent>("/dashboard/dojang", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export type PromoTemplateListItem = {
  id: string;
  type: PromoTemplateType;
  typeLabel: string;
  title: string;
  createdAt: string;
};

export async function fetchMyTemplates(): Promise<PromoTemplateListItem[]> {
  const rows = await apiJson<PromoTemplateListItem[]>("/dashboard/templates");
  return rows.map((row) => ({
    ...row,
    typeLabel: row.typeLabel || PROMO_TYPE_LABELS[row.type],
  }));
}

export async function savePromoTemplate(
  content: PromoTemplateContent,
): Promise<{ id: string; success: string }> {
  return apiJson("/dashboard/templates", {
    method: "POST",
    body: JSON.stringify({
      type: content.type,
      content,
    }),
  });
}
