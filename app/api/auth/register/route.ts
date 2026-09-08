import { NextResponse } from "next/server";
import { ensureOwnerProfile } from "@/lib/auth/ensure-owner-profile";
import { mapAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

type RegisterRequestBody = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  dojangName?: unknown;
};

type RegisterSuccessResponse = {
  ok: true;
  needsEmailConfirm?: boolean;
};

type RegisterErrorResponse = {
  error: string;
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: RegisterRequestBody;
  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 400 },
    );
  }

  const email = readString(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const name = readString(body.name);
  const dojangName = readString(body.dojangName);

  if (!dojangName) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "체육관 이름을 입력해 주세요" },
      { status: 400 },
    );
  }

  if (!name) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "이름을 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!email) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "올바른 이메일 주소를 입력해 주세요." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "비밀번호는 6자 이상이어야 합니다." },
      { status: 400 },
    );
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "Supabase 환경변수가 없습니다. .env.local을 확인해 주세요." },
      { status: 500 },
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const supabase = createClient();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, dojangName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (signUpError) {
    const message = mapAuthError(signUpError.message);
    const status = message.includes("이미 가입된") ? 409 : 400;
    return NextResponse.json<RegisterErrorResponse>(
      { error: message },
      { status },
    );
  }

  if (data.user?.identities && data.user.identities.length === 0) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: "이미 가입된 이메일입니다. 로그인해 주세요." },
      { status: 409 },
    );
  }

  if (!data.session || !data.user) {
    return NextResponse.json<RegisterSuccessResponse>({
      ok: true,
      needsEmailConfirm: true,
    });
  }

  const { error: bootstrapError } = await ensureOwnerProfile(supabase, {
    userId: data.user.id,
    name,
    dojangName,
  });

  if (bootstrapError) {
    return NextResponse.json<RegisterErrorResponse>(
      { error: bootstrapError },
      { status: 500 },
    );
  }

  return NextResponse.json<RegisterSuccessResponse>({ ok: true });
}
