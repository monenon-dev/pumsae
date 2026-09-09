"use client";

import { apiFetch, apiJson, throwIfNotOk } from "@/lib/api/client";
import {
  type DojangLandingContent,
  type HeroLayout,
  withNormalizedHeroLayout,
} from "@/types/dojang";
import type { PromoTemplateContent } from "@/types/promo-template";
import { PROMO_TYPE_LABELS, type PromoTemplateType } from "@/types/promo-template";

export async function fetchMyDojang(): Promise<DojangLandingContent> {
  const data = await apiJson<DojangLandingContent>("/dashboard/dojang");
  return withNormalizedHeroLayout(data);
}

export async function updateMyDojang(
  input: Partial<{
    name: string;
    description: string | null;
    logoUrl: string | null;
    heroImageUrl: string | null;
    brandColor: string | null;
    heroLayout: HeroLayout;
  }>,
): Promise<DojangLandingContent> {
  const data = await apiJson<DojangLandingContent>("/dashboard/dojang", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return withNormalizedHeroLayout(data);
}

export type DashboardProfile = {
  name: string;
  email: string;
  role: "OWNER" | "INSTRUCTOR";
  dojangName: string | null;
};

export async function fetchMyProfile(): Promise<DashboardProfile> {
  return apiJson<DashboardProfile>("/dashboard/me");
}

export async function updateMyProfile(name: string): Promise<DashboardProfile> {
  return apiJson<DashboardProfile>("/dashboard/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function updateMyRole(
  role: "OWNER" | "INSTRUCTOR",
): Promise<DashboardProfile> {
  return apiJson<DashboardProfile>("/dashboard/me", {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: string }> {
  return apiJson<{ success: string }>("/dashboard/me/password", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuthRefresh: true,
  });
}

export type PromoTemplateListItem = {
  id: string;
  type: PromoTemplateType;
  typeLabel: string;
  title: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

export type PromoTemplateDetail = PromoTemplateListItem & {
  content: PromoTemplateContent;
};

export async function fetchMyTemplates(): Promise<PromoTemplateListItem[]> {
  const rows = await apiJson<PromoTemplateListItem[]>("/dashboard/templates");
  return rows.map((row) => ({
    ...row,
    typeLabel: row.typeLabel || PROMO_TYPE_LABELS[row.type],
  }));
}

export async function fetchPromoTemplate(
  id: string,
): Promise<PromoTemplateDetail> {
  return apiJson<PromoTemplateDetail>(
    `/dashboard/templates/${encodeURIComponent(id)}`,
  );
}

export async function savePromoTemplate(
  content: PromoTemplateContent,
): Promise<{ id: string; success: string }> {
  return apiJson("/dashboard/templates", {
    method: "POST",
    body: JSON.stringify({
      type: content.type,
      content,
      thumbnailUrl: content.imageUrl,
    }),
  });
}

export async function updatePromoTemplate(
  id: string,
  content: PromoTemplateContent,
): Promise<{ id: string; success: string }> {
  return apiJson(`/dashboard/templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      type: content.type,
      content,
      thumbnailUrl: content.imageUrl,
    }),
  });
}

export async function downloadPromoPng(id: string, filename?: string): Promise<void> {
  const response = await apiFetch(
    `/dashboard/templates/${encodeURIComponent(id)}/export`,
  );
  await throwIfNotOk(response, "고화질 이미지를 만들지 못했습니다.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? `pumsae-${id.slice(0, 8)}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
