import type { DojangLandingContent } from "@/types/dojang";

export function getCopy(
  content: DojangLandingContent,
  key: string,
  fallback: string,
): string {
  const value = content.sectionText?.[key];
  return value && value.trim() ? value : fallback;
}
