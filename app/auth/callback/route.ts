import { NextResponse } from "next/server";
import { ensureOwnerProfile } from "@/lib/auth/ensure-owner-profile";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const name =
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      user.email?.split("@")[0] ||
      "관장";
    const dojangName =
      typeof user.user_metadata?.dojangName === "string"
        ? user.user_metadata.dojangName
        : undefined;

    await ensureOwnerProfile(supabase, {
      userId: user.id,
      name,
      dojangName,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
