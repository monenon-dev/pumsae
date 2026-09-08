"use client";

import { useEffect, useState } from "react";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { fetchMyDojang } from "@/lib/api/dashboard";

export default function NewTemplatePage() {
  const [dojangName, setDojangName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchMyDojang()
      .then((data) => {
        if (!cancelled) {
          setDojangName(data.name);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDojangName(null);
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
    return <p className="text-sm text-zinc-500">편집기를 불러오는 중...</p>;
  }

  if (!dojangName) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">카드뉴스 만들기</h1>
        <p className="mt-2 text-sm text-zinc-600">
          소속 체육관을 찾지 못했습니다. 다시 로그인한 뒤 시도해 주세요.
        </p>
      </section>
    );
  }

  return <TemplateEditor dojangName={dojangName} />;
}
