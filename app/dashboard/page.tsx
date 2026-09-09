"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDashboardStatus } from "@/components/dashboard/DashboardStatusProvider";
import { daysAgoLabel } from "@/lib/format";

const cardClassName =
  "rounded-2xl border border-pumsae-line bg-white p-5 shadow-sm transition hover:border-pumsae-ink/20";

export default function DashboardPage() {
  const { user } = useAuth();
  const { loading, dojang, landingSaved, templatesCount, pendingTrialsCount } =
    useDashboardStatus();

  const displayName = user?.name ?? user?.email ?? "관장님";
  const roleLabel = user?.role === "INSTRUCTOR" ? "강사" : "관장";

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
      <p className="mt-2 text-sm text-pumsae-muted">
        안녕하세요, {displayName}님 ({roleLabel})
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/landing" className={cardClassName}>
          <p className="text-sm font-medium text-pumsae-muted">홍보</p>
          <h2 className="mt-1 text-lg font-semibold">랜딩페이지 만들기</h2>
          <p className="mt-2 text-sm leading-6 text-pumsae-muted">
            이름, 소개, 사진만 입력하면 공개 홍보 페이지가 생성됩니다.
          </p>
          {!loading ? (
            <p className="mt-4 text-sm font-medium text-pumsae-accent">
              {landingSaved && dojang?.updatedAt
                ? `마지막 수정: ${daysAgoLabel(dojang.updatedAt)}`
                : "아직 만들지 않았어요 → 지금 시작하기"}
            </p>
          ) : null}
        </Link>

        <Link href="/dashboard/templates/new" className={cardClassName}>
          <p className="text-sm font-medium text-pumsae-muted">홍보</p>
          <h2 className="mt-1 text-lg font-semibold">카드뉴스 만들기</h2>
          <p className="mt-2 text-sm leading-6 text-pumsae-muted">
            대회 수상, 띠 승급, 모집, 행사 카드를 편집하고 바로 내려받으세요.
          </p>
          {!loading ? (
            <p className="mt-4 text-sm font-medium text-pumsae-ink">
              {templatesCount > 0
                ? `지금까지 ${templatesCount}개 만들었어요`
                : "아직 만든 카드가 없어요"}
            </p>
          ) : null}
        </Link>

        <Link href="/dashboard/trials" className={cardClassName}>
          <p className="text-sm font-medium text-pumsae-muted">접수</p>
          <h2 className="mt-1 text-lg font-semibold">체험 신청 확인</h2>
          <p className="mt-2 text-sm leading-6 text-pumsae-muted">
            학부모 신청이 들어오면 바로 알림을 받고 확정·거절할 수 있습니다.
          </p>
          {!loading ? (
            <p className="mt-4 text-sm font-semibold text-pumsae-ink">
              {pendingTrialsCount > 0 ? (
                <>
                  확인 대기{" "}
                  <span className="text-pumsae-accent">
                    {pendingTrialsCount}건
                  </span>
                </>
              ) : (
                "확인 대기 없음"
              )}
            </p>
          ) : null}
        </Link>

        {dojang ? (
          <Link href={`/${dojang.slug}`} className={cardClassName}>
            <p className="text-sm font-medium text-pumsae-muted">공개 주소</p>
            <h2 className="mt-1 text-lg font-semibold">/{dojang.slug}</h2>
            <p className="mt-2 text-sm leading-6 text-pumsae-muted">
              학부모에게 공유할 체육관 페이지입니다.
            </p>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
