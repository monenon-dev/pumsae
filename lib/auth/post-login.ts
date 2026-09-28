export async function resolvePostLoginPath(explicitNext: string | null): Promise<string> {
  if (explicitNext && explicitNext.startsWith("/") && !explicitNext.startsWith("//")) {
    return explicitNext;
  }
  return "/";
}
