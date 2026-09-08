"use client";

import { useEffect, useState } from "react";
import { LandingEditor } from "@/components/landing/LandingEditor";
import { fetchMyDojang } from "@/lib/api/dashboard";
import type { DojangLandingContent } from "@/types/dojang";

export default function LandingDashboardPage() {
  const [dojang, setDojang] = useState<DojangLandingContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchMyDojang()
      .then((data) => {
        if (!cancelled) {
          setDojang(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDojang(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-500">랜딩페이지를 불러오는 중...</p>;
  }

  if (!dojang) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">랜딩페이지</h1>
        <p className="mt-2 text-sm text-zinc-600">
          소속 체육관을 찾지 못했습니다. 다시 로그인한 뒤 시도해 주세요.
        </p>
      </section>
    );
  }

  return <LandingEditor initial={dojang} />;
}
