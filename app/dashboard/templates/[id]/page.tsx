"use client";

import { useEffect, useState } from "react";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { fetchMyDojang, fetchPromoTemplate } from "@/lib/api/dashboard";
import { sanitizePromoContent } from "@/lib/promo/content";
import { createPromoContent } from "@/lib/promo/layouts";
import type { PromoTemplateContent } from "@/types/promo-template";

type EditTemplatePageProps = {
  params: { id: string };
};

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const [dojangName, setDojangName] = useState<string | null>(null);
  const [content, setContent] = useState<PromoTemplateContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchMyDojang(), fetchPromoTemplate(params.id)])
      .then(([dojang, template]) => {
        if (cancelled) {
          return;
        }
        const fallback = createPromoContent(template.type, dojang.name);
        const sanitized = sanitizePromoContent({
          ...fallback,
          ...template.content,
          type: template.type,
          dojangName: template.content.dojangName || dojang.name,
        });
        if (!sanitized) {
          setError("저장된 카드 내용을 읽지 못했습니다.");
          return;
        }
        setDojangName(dojang.name);
        setContent(sanitized);
      })
      .catch(() => {
        if (!cancelled) {
          setError("템플릿을 찾을 수 없습니다.");
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
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-zinc-500">편집기를 불러오는 중...</p>;
  }

  if (!dojangName || !content) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">카드뉴스 수정</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {error ?? "템플릿을 찾을 수 없습니다."}
        </p>
      </section>
    );
  }

  return (
    <TemplateEditor
      dojangName={dojangName}
      templateId={params.id}
      initialContent={content}
    />
  );
}
