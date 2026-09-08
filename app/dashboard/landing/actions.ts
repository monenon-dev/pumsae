"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeHexColor } from "@/lib/dojang/brand";
import { DEFAULT_BRAND_COLOR } from "@/types/dojang";

export type LandingActionState = {
  error?: string;
  success?: string;
  slug?: string;
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function emptyToNull(value: string): string | null {
  return value.length > 0 ? value : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateDojangLanding(
  _prev: LandingActionState,
  formData: FormData,
): Promise<LandingActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const name = readText(formData, "name");
  const description = readText(formData, "description");
  const logoUrl = readText(formData, "logo_url");
  const heroImageUrl = readText(formData, "hero_image_url");
  const brandColor = normalizeHexColor(
    readText(formData, "brand_color"),
    DEFAULT_BRAND_COLOR,
  );

  if (!name) {
    return { error: "도장 이름을 입력해 주세요." };
  }

  if (logoUrl && !isHttpUrl(logoUrl)) {
    return { error: "로고는 http(s) 이미지 주소여야 합니다." };
  }

  if (heroImageUrl && !isHttpUrl(heroImageUrl)) {
    return { error: "대표 사진은 http(s) 이미지 주소여야 합니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojang_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.dojang_id) {
    return { error: "소속 체육관이 없습니다." };
  }

  const { data: updated, error } = await supabase
    .from("dojangs")
    .update({
      name,
      description: emptyToNull(description),
      logo_url: emptyToNull(logoUrl),
      hero_image_url: emptyToNull(heroImageUrl),
      brand_color: brandColor,
    })
    .eq("id", profile.dojang_id)
    .select("slug")
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "저장에 실패했습니다." };
  }

  revalidatePath("/dashboard/landing");
  revalidatePath(`/${updated.slug}`);

  return {
    success: "랜딩페이지를 저장했습니다.",
    slug: updated.slug,
  };
}
