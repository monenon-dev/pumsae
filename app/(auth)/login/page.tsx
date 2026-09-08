"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { GuestGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";
import { mapAuthError } from "@/lib/auth/errors";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
      router.replace(safeNextPath(searchParams.get("next")));
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
      <h1 className="text-xl font-semibold tracking-tight">로그인</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        관장님 계정으로 대시보드에 들어갑니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
          />
        </label>

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
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        아직 체육관이 없나요?{" "}
        <Link href="/register" className="font-medium text-zinc-900 underline">
          새로 등록
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-zinc-500">로그인 화면을 불러오는 중...</p>
      }
    >
      <GuestGuard>
        <LoginForm />
      </GuestGuard>
    </Suspense>
  );
}
