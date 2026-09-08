import type { SupabaseClient } from "@supabase/supabase-js";
import { randomSlugSuffix, slugifyName } from "@/lib/auth/slug";

type EnsureOwnerInput = {
  userId: string;
  name: string;
  dojangName?: string;
};

export async function ensureOwnerProfile(
  supabase: SupabaseClient,
  { userId, name, dojangName }: EnsureOwnerInput,
): Promise<{ error: string | null }> {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (existing) {
    return { error: null };
  }

  const displayName = name.trim() || "관장";
  const gymName = dojangName?.trim() || displayName;
  const baseSlug = slugifyName(gymName);
  let slug = baseSlug;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (attempt > 0) {
      slug = `${baseSlug}-${randomSlugSuffix()}`;
    }

    const { data: dojang, error: dojangError } = await supabase
      .from("dojangs")
      .insert({
        name: gymName,
        slug,
      })
      .select("id")
      .single();

    if (dojangError) {
      if (dojangError.code === "23505") {
        continue;
      }
      return { error: dojangError.message };
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      dojang_id: dojang.id,
      name: displayName,
      role: "OWNER",
    });

    if (profileError) {
      return { error: profileError.message };
    }

    return { error: null };
  }

  return { error: "체육관 주소를 만들지 못했습니다. 다시 시도해 주세요." };
}
