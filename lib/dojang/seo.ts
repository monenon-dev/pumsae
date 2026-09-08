import type { DojangLandingContent } from "@/types/dojang";

export function dojangSeo(dojang: DojangLandingContent): {
  title: string;
  description: string;
} {
  const title = `${dojang.name} | PUMSAE`;
  const fromCopy = dojang.description?.trim() ?? "";
  if (fromCopy) {
    return { title, description: fromCopy };
  }

  const place = [dojang.region, dojang.address].filter(Boolean).join(" ");
  return {
    title,
    description: place
      ? `${dojang.name} · ${place}`
      : `${dojang.name}에서 체험 수업을 신청하세요.`,
  };
}
