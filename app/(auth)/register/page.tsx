"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { mapAuthError } from "@/lib/auth/errors";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

type RegisterResponse = {
  ok?: true;
  needsEmailConfirm?: boolean;
  error?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [dojangName, setDojangName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const gymName = dojangName.trim();
    const displayName = name.trim();

    if (!gymName) {
      setError("체육관 이름을 입력해 주세요");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dojangName: gymName,
          name: displayName,
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response.json()) as RegisterResponse;

      if (!response.ok || payload.error) {
        setError(payload.error ?? "요청을 처리하지 못했습니다.");
        return;
      }

      if (payload.needsEmailConfirm) {
        setInfo("가입 확인 메일을 보냈습니다. 메일 인증 후 로그인해 주세요.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "요청을 처리하지 못했습니다.";
      setError(
        message.includes("URL and Key")
          ? "Supabase 환경변수가 없습니다. .env.local을 확인해 주세요."
          : mapAuthError(message),
      );
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

        {info ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {info}
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
