"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";
import { fetchMyDojang } from "@/lib/api/dashboard";
import type { DojangLandingContent } from "@/types/dojang";

export default function DashboardPage() {
  const { user } = useAuth();
  const [dojang, setDojang] = useState<DojangLandingContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMyDojang()
      .then((data) => {
        if (!cancelled) {
          setDojang(data);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setDojang(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.name ?? user?.email ?? "관장님";
  const roleLabel = user?.role === "INSTRUCTOR" ? "강사" : "관장";

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
      <p className="mt-2 text-sm text-zinc-600">
        안녕하세요, {displayName}님 ({roleLabel})
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/landing"
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
        >
          <p className="text-sm font-medium text-zinc-500">홍보</p>
          <h2 className="mt-1 text-lg font-semibold">랜딩페이지 만들기</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            이름, 소개, 사진만 입력하면 공개 홍보 페이지가 생성됩니다.
          </p>
        </Link>
        <Link
          href="/dashboard/templates/new"
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
        >
          <p className="text-sm font-medium text-zinc-500">홍보</p>
          <h2 className="mt-1 text-lg font-semibold">카드뉴스 만들기</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            대회 수상, 띠 승급, 모집, 행사 카드를 편집하고 바로 내려받으세요.
          </p>
        </Link>
        <Link
          href="/dashboard/trials"
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
        >
          <p className="text-sm font-medium text-zinc-500">접수</p>
          <h2 className="mt-1 text-lg font-semibold">체험 신청 확인</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            학부모 신청이 들어오면 바로 알림을 받고 확정·거절할 수 있습니다.
          </p>
        </Link>
        {dojang ? (
          <Link
            href={`/${dojang.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
          >
            <p className="text-sm font-medium text-zinc-500">공개 주소</p>
            <h2 className="mt-1 text-lg font-semibold">/{dojang.slug}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              학부모에게 공유할 체육관 페이지입니다.
            </p>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
