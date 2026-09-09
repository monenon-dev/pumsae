"use client";

import Link from "next/link";
import { Suspense } from "react";
import { GuestGuard } from "@/components/auth/AuthGuard";
import { PumsaeLogo } from "@/components/ui/Logo";

const FEATURES = [
  {
    title: "랜딩페이지 빌더",
    description: "이름과 사진만 넣으면 홍보 페이지가 완성돼요",
    icon: (
      <path
        d="M4 5h16v14H4zM4 9h16M8 13h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "카드뉴스 생성기",
    description: "대회 수상, 띠 승급 소식을 인스타용 카드로 바로 만들어요",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 15l2.5-3 2 2.5L16 10l3 5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "체험 신청 관리",
    description: "학부모 신청을 실시간으로 받고 바로 확인해요",
    icon: (
      <>
        <path d="M6 4h9l3 3v13H6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-6 w-6 text-pumsae-accent"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function LandingHome() {
  return (
    <div className="min-h-screen bg-pumsae-bg text-pumsae-ink">
      <header className="border-b border-pumsae-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <PumsaeLogo />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-pumsae-ink hover:bg-pumsae-line"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-pumsae-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-pumsae-accent-dark"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            체육관 홍보와 수강생 관리, 한 곳에서
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-pumsae-muted">
            관장님이 텍스트와 사진만 입력하면 홍보 페이지가 만들어지고,
            체험 신청까지 실시간으로 받을 수 있어요.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-pumsae-accent px-6 py-3 text-sm font-semibold text-white hover:bg-pumsae-accent-dark"
            >
              무료로 시작하기
            </Link>
          </div>
        </section>

        <section className="border-t border-pumsae-line bg-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-pumsae-line p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pumsae-accent/10">
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                  </div>
                  <h2 className="mt-4 text-base font-semibold">
                    {feature.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-pumsae-muted">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-pumsae-line">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight">
              지금 바로 우리 체육관 홍보를 시작해 보세요
            </h2>
            <div className="mt-6">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-pumsae-accent px-6 py-3 text-sm font-semibold text-white hover:bg-pumsae-accent-dark"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-pumsae-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-sm text-pumsae-muted sm:px-6">
          <PumsaeLogo />
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-pumsae-ink hover:underline">
              로그인
            </Link>
            <Link
              href="/register"
              className="hover:text-pumsae-ink hover:underline"
            >
              회원가입
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <GuestGuard>
        <LandingHome />
      </GuestGuard>
    </Suspense>
  );
}
