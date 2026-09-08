"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchMyTemplates,
  type PromoTemplateListItem,
} from "@/lib/api/dashboard";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PromoTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchMyTemplates()
      .then((rows) => {
        if (!cancelled) {
          setTemplates(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTemplates([]);
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

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">카드뉴스</h1>
          <p className="mt-2 text-sm text-zinc-600">
            대회 수상, 띠 승급, 모집, 행사 카드를 만들어 바로 내려받으세요.
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          새로 만들기
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-zinc-500">목록을 불러오는 중...</p>
      ) : templates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-600">아직 저장한 카드가 없습니다.</p>
          <Link
            href="/dashboard/templates/new"
            className="mt-3 inline-block text-sm font-medium text-zinc-900 underline"
          >
            첫 카드뉴스 만들기
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <li
              key={template.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {template.typeLabel}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{template.title}</h2>
              <p className="mt-2 text-sm text-zinc-500">
                {new Date(template.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
