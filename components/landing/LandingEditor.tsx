"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { updateMyDojang } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";
import { normalizeHexColor } from "@/lib/dojang/brand";
import {
  BRAND_COLOR_PRESETS,
  DEFAULT_BRAND_COLOR,
  type DojangLandingContent,
} from "@/types/dojang";

type LandingEditorProps = {
  initial: DojangLandingContent;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

function SaveButton({
  disabled,
  saving,
}: {
  disabled: boolean;
  saving: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || saving}
      className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 sm:w-auto"
    >
      {saving ? "저장 중..." : "저장하기"}
    </button>
  );
}

export function LandingEditor({ initial }: LandingEditorProps) {
  const [content, setContent] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const previewContent = useMemo(() => content, [content]);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  function updateField<K extends keyof DojangLandingContent>(
    key: K,
    value: DojangLandingContent[K],
  ) {
    setContent((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const saved = await updateMyDojang({
        name: content.name,
        description: content.description,
        logoUrl: content.logoUrl,
        heroImageUrl: content.heroImageUrl,
        brandColor: normalizeHexColor(
          content.brandColor,
          DEFAULT_BRAND_COLOR,
        ),
      });
      setContent(saved);
      setSuccess("랜딩페이지를 저장했습니다.");
    } catch (saveError) {
      const message =
        saveError instanceof ApiError
          ? saveError.message
          : "저장에 실패했습니다.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:items-start">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              랜딩페이지 편집
            </h1>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              이름, 소개, 사진만 넣으면 공개 페이지가 바로 바뀝니다.
            </p>
          </div>
          <Link
            href={`/${content.slug}`}
            target="_blank"
            className="shrink-0 text-sm font-medium text-zinc-900 underline"
          >
            공개 페이지 보기
          </Link>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            도장 이름
            <input
              name="name"
              required
              value={content.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            소개글
            <textarea
              name="description"
              rows={4}
              value={content.description ?? ""}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className={inputClassName}
              placeholder="우리 체육관을 한두 문장으로 소개해 주세요."
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">대표 사진</legend>
            <input
              type="url"
              name="hero_image_url"
              value={content.heroImageUrl ?? ""}
              onChange={(event) =>
                updateField("heroImageUrl", event.target.value || null)
              }
              className={inputClassName}
              placeholder="https://..."
            />
            <p className="text-sm text-zinc-500">
              이미지 주소(https://...)를 붙여넣으면 됩니다. 파일 직접 업로드는 R2 연동 단계에서 붙입니다.
            </p>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">로고</legend>
            <input
              type="url"
              name="logo_url"
              value={content.logoUrl ?? ""}
              onChange={(event) =>
                updateField("logoUrl", event.target.value || null)
              }
              className={inputClassName}
              placeholder="https://..."
            />
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">브랜드 컬러</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="color"
                name="brand_color"
                value={content.brandColor || DEFAULT_BRAND_COLOR}
                onChange={(event) =>
                  updateField("brandColor", event.target.value)
                }
                className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-white p-1"
              />
              {BRAND_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateField("brandColor", preset.value)}
                  className="h-8 w-8 rounded-full border border-zinc-200"
                  style={{ backgroundColor: preset.value }}
                  aria-label={preset.label}
                  title={preset.label}
                />
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {success}
            </p>
          ) : null}

          <SaveButton disabled={false} saving={saving} />
        </form>
      </section>

      <section className="xl:sticky xl:top-4">
        <p className="mb-3 text-sm font-medium text-zinc-600">실시간 미리보기</p>
        <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm max-xl:max-h-[70vh] max-xl:overflow-y-auto xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className="pointer-events-none">
            <DojangLanding content={previewContent} preview />
          </div>
        </div>
      </section>
    </div>
  );
}
