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
