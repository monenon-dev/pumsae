const SLUG_MAX = 40;

export function slugifyName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);

  return slug || "dojang";
}

export function randomSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}
