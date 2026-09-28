"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  downloadPromoPng,
  fetchMyTemplates,
  setPromoTemplatePublic,
  type PromoTemplateListItem,
} from "@/lib/api/dashboard";

function PublicToggle({
  template,
  onChange,
}: {
  template: PromoTemplateListItem;
  onChange: (isPublic: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !template.isPublic;
    setSaving(true);
    onChange(next);
    try {
      await setPromoTemplatePublic(template.id, next);
    } catch (error) {
      onChange(!next);
      window.alert(
        error instanceof Error
          ? error.message
          : "공개 설정을 바꾸지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={template.isPublic}
      disabled={saving}
      onClick={() => void toggle()}
      className="flex items-center gap-2 text-sm font-medium text-zinc-700 disabled:opacity-60"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          template.isPublic ? "bg-pumsae-accent" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            template.isPublic ? "translate-x-[1.125rem]" : "translate-x-0.5"
          }`}
        />
      </span>
      홈페이지에 공개
    </button>
  );
}

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
            &quot;홈페이지에 공개&quot;를 켠 카드는 내 홈페이지의 &quot;우리
            도장 소식&quot;에 보여요.
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
              <Link
                href={`/dashboard/templates/${template.id}`}
                className="block hover:opacity-90"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {template.typeLabel}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{template.title}</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {new Date(template.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </Link>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <PublicToggle
                  template={template}
                  onChange={(isPublic) =>
                    setTemplates((current) =>
                      current.map((item) =>
                        item.id === template.id ? { ...item, isPublic } : item,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="text-sm font-medium text-zinc-900 underline"
                  onClick={() =>
                    void downloadPromoPng(
                      template.id,
                      `pumsae-${template.type.toLowerCase()}.png`,
                    ).catch((error: unknown) => {
                      window.alert(
                        error instanceof Error
                          ? error.message
                          : "고화질 이미지를 만들지 못했습니다.",
                      );
                    })
                  }
                >
                  고화질 PNG
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
