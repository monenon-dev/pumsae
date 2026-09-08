export type DojangLandingContent = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  brandColor: string | null;
  region: string | null;
  address: string | null;
  phone: string | null;
};

export const DEFAULT_BRAND_COLOR = "#b91c1c";

export const BRAND_COLOR_PRESETS = [
  { label: "태권 레드", value: "#b91c1c" },
  { label: "먹색", value: "#18181b" },
  { label: "남색", value: "#1e3a8a" },
  { label: "숲초록", value: "#166534" },
] as const;
