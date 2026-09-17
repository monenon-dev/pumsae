import type { CSSProperties } from "react";
import type { SectionSpacing } from "@/types/dojang";

export function landingCssVars(brand: string, brandFg: string): CSSProperties {
  return {
    "--landing-brand": brand,
    "--landing-brand-fg": brandFg,
    "--landing-brand-soft": hexToRgba(brand, 0.14),
  } as CSSProperties;
}

export function normalizeHexColor(
  value: string | null | undefined,
  fallback: string,
): string {
  const hex = value?.trim() ?? "";
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toLowerCase();
  }
  return fallback;
}

export function getReadableTextColor(hex: string): "#ffffff" | "#18181b" {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) {
    return "#ffffff";
  }

  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.62 ? "#18181b" : "#ffffff";
}

export function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function sectionPaddingClass(
  spacing: SectionSpacing,
  normalClass: string,
): string {
  if (spacing === "COMPACT") {
    return "py-6 sm:py-8";
  }
  if (spacing === "SPACIOUS") {
    return "py-16 sm:py-24";
  }
  return normalClass;
}

export function heroMinHeightClass(
  spacing: SectionSpacing,
  normalClass: string,
): string {
  if (spacing === "COMPACT") {
    return "min-h-[52svh]";
  }
  if (spacing === "SPACIOUS") {
    return "min-h-[92svh]";
  }
  return normalClass;
}

export function heroContentPaddingClass(spacing: SectionSpacing): string {
  if (spacing === "COMPACT") {
    return "px-5 pb-6 pt-10 sm:px-8 sm:pb-8";
  }
  if (spacing === "SPACIOUS") {
    return "px-5 pb-14 pt-28 sm:px-8 sm:pb-16";
  }
  return "px-5 pb-10 pt-20 sm:px-8 sm:pb-12";
}
