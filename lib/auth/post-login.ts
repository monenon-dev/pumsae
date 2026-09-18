import { fetchMyDojang } from "@/lib/api/dashboard";

export async function resolvePostLoginPath(explicitNext: string | null): Promise<string> {
  if (explicitNext && explicitNext.startsWith("/") && !explicitNext.startsWith("//")) {
    return explicitNext;
  }
  try {
    const dojang = await fetchMyDojang();
    return `/${dojang.slug}`;
  } catch {
    return "/dashboard";
  }
}
