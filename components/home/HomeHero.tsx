"use client";

import Link from "next/link";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { ScaledFrame } from "@/components/ui/ScaledFrame";
import { EXAMPLE_DOJANG, EXAMPLE_SLUG } from "./example-data";

/** 홈 맨 위: 왼쪽은 소개와 시작 버튼, 오른쪽은 실제 화면 코드로 그린 예시 홍보 페이지. */
export function HomeHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="bg-gradient-to-b from-white to-pumsae-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="text-center lg:text-left">
          <span className="inline-flex rounded-full border border-pumsae-line bg-white px-3 py-1 text-xs font-medium text-pumsae-muted">
            태권도장 홍보 · 수강생 관리
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            체육관 홍보와
            <br />
            수강생 관리, 한 곳에서
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-pumsae-muted sm:text-lg lg:mx-0">
            관장님이 텍스트와 사진만 입력하면 홍보 페이지가 만들어지고, 체험 신청까지 실시간으로
            받을 수 있어요.
          </p>
          <div className="mt-8">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center rounded-lg bg-pumsae-accent px-6 py-3 text-sm font-semibold text-white hover:bg-pumsae-accent-dark"
            >
              {isLoggedIn ? "대시보드로 가기" : "로그인하고 시작하기"}
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-pumsae-line bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-pumsae-line bg-zinc-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-zinc-500">
              pumsae.vercel.app/{EXAMPLE_SLUG}
            </span>
          </div>
          <ScaledFrame baseWidth={1280} aspectRatio="16 / 10">
            <DojangLanding content={EXAMPLE_DOJANG} preview />
          </ScaledFrame>
        </div>
      </div>
    </section>
  );
}
