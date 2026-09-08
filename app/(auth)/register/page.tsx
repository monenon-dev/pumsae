"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { GuestGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";
import { mapAuthError } from "@/lib/auth/errors";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-zinc-500">등록 화면을 불러오는 중...</p>
      }
    >
      <GuestGuard>
        <RegisterForm />
      </GuestGuard>
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [dojangName, setDojangName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const gymName = dojangName.trim();
    const displayName = name.trim();

    if (!gymName) {
      setError("체육관 이름을 입력해 주세요");
      return;
    }

    setLoading(true);

    try {
      await register({
        dojangName: gymName,
        name: displayName,
        email: email.trim(),
        password,
      });
      router.replace("/dashboard");
    } catch (submitError) {
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : "요청을 처리하지 못했습니다.";
      setError(mapAuthError(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">체육관 등록</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        우리 체육관을 새로 등록하고 홍보 페이지를 시작합니다. 기존 체육관 합류는
        다음 단계에서 지원할 예정입니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          체육관 이름
          <input
            type="text"
            name="dojangName"
            required
            value={dojangName}
            onChange={(event) => setDojangName(event.target.value)}
            className={inputClassName}
            placeholder="강남 태권도장"
          />
        </label>

        <label className="block text-sm font-medium">
          이름
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="홍길동"
          />
        </label>

        <label className="block text-sm font-medium">
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="owner@example.com"
          />
        </label>

        <label className="block text-sm font-medium">
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder="6자 이상"
          />
        </label>

        <p className="text-sm leading-6 text-zinc-500">
          주소, 전화번호 등은 가입 후 대시보드에서 입력할 수 있어요.
        </p>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? "등록 중..." : "체육관 등록하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          로그인
        </Link>
      </p>
    </>
  );
}
