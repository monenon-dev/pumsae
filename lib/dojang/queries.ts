import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { DojangLandingContent } from "@/types/dojang";

type DojangRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  brand_color: string | null;
  region: string | null;
  address: string | null;
  phone: string | null;
};

function mapDojang(row: DojangRow): DojangLandingContent {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    heroImageUrl: row.hero_image_url,
    brandColor: row.brand_color,
    region: row.region,
    address: row.address,
    phone: row.phone,
  };
}

const DOJANG_COLUMNS =
  "id, name, slug, description, logo_url, hero_image_url, brand_color, region, address, phone";

export const getDojangBySlug = cache(async (
  slug: string,
): Promise<DojangLandingContent | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("dojangs")
    .select(DOJANG_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDojang(data as DojangRow);
});

export async function getOwnerDojang(): Promise<DojangLandingContent | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dojang_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.dojang_id) {
    return null;
  }

  const { data, error } = await supabase
    .from("dojangs")
    .select(DOJANG_COLUMNS)
    .eq("id", profile.dojang_id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDojang(data as DojangRow);
}
