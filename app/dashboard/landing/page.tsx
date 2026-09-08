"use client";

import { useEffect, useState } from "react";
import { LandingEditor } from "@/components/landing/LandingEditor";
import { fetchMyDojang } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";
import type { DojangLandingContent } from "@/types/dojang";

export default function LandingDashboardPage() {
  const [dojang, setDojang] = useState<DojangLandingContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchMyDojang()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setDojang(data);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }
        setDojang(null);
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "랜딩페이지를 불러오지 못했습니다.",
        );
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
          {error ?? "소속 체육관을 찾지 못했습니다. 다시 로그인한 뒤 시도해 주세요."}
        </p>
      </section>
    );
  }

  return <LandingEditor initial={dojang} />;
}
