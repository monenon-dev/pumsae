"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { ImageField } from "@/components/upload/ImageField";
import { updateMyDojang } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";
import { hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { isHttpUrl } from "@/lib/dojang/url";
import {
  BRAND_COLOR_PRESETS,
  DEFAULT_BRAND_COLOR,
  HEADING_FONTS,
  HEADING_FONT_LABELS,
  HEADING_FONT_VARS,
  HERO_LAYOUTS,
  HERO_LAYOUT_LABELS,
  type DojangLandingContent,
  type HeroLayout,
  withNormalizedHeroLayout,
} from "@/types/dojang";

type LandingEditorProps = {
  initial: DojangLandingContent;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500";

function HeroLayoutThumb({
  layout,
  brand,
}: {
  layout: HeroLayout;
  brand: string;
}) {
  if (layout === "GRADIENT") {
    return (
      <span
        className="block aspect-square"
        style={{
          background: `linear-gradient(160deg, ${brand} 0%, #111827 72%)`,
        }}
      />
    );
  }

  if (layout === "SOLID") {
    return (
      <span className="block aspect-square" style={{ backgroundColor: brand }} />
    );
  }

  if (layout === "PHOTO_COVER") {
    return (
      <span className="relative block aspect-square overflow-hidden bg-zinc-500">
        <span
          className="absolute inset-x-0 top-[18%] h-[28%] opacity-70"
          style={{ backgroundColor: brand }}
        />
        <span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,0.72), ${hexToRgba(brand, 0.28)})`,
          }}
        />
      </span>
    );
  }

  if (layout === "SPLIT") {
    return (
      <span className="flex aspect-square overflow-hidden">
        <span className="w-1/2" style={{ backgroundColor: brand }} />
        <span className="relative w-1/2 bg-zinc-400">
          <span className="absolute inset-x-0 top-1/3 h-1/3 bg-zinc-300" />
        </span>
      </span>
    );
  }

  if (layout === "TRADITIONAL") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{ backgroundColor: "#F5F0E4" }}
      >
        <span
          className="absolute -right-3 -top-3 h-10 w-10 rounded-full"
          style={{ border: "1px solid rgba(28,28,28,0.25)" }}
        />
        <span
          className="absolute bottom-0 right-1 text-2xl font-black leading-none"
          style={{ color: "rgba(28,28,28,0.15)" }}
        >
          道
        </span>
        <span
          className="absolute bottom-1.5 left-1.5 h-1 w-4 rounded-full"
          style={{ backgroundColor: brand }}
        />
      </span>
    );
  }

  if (layout === "DYNAMIC") {
    return (
      <span className="relative block aspect-square overflow-hidden bg-black">
        <span
          className="absolute -right-2 -top-3 h-7 w-7 rotate-[18deg]"
          style={{ backgroundColor: brand }}
        />
        <span
          className="absolute -right-4 top-3 h-6 w-6 rotate-[-12deg] opacity-50"
          style={{ backgroundColor: brand }}
        />
      </span>
    );
  }

  if (layout === "KIDS") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FDE68A 0%, #86EFAC 50%, #93C5FD 100%)",
        }}
      >
        <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/50" />
        <span className="absolute bottom-1 left-1 h-4 w-4 rounded-full bg-white/40" />
      </span>
    );
  }

  return (
    <span
      className="relative block aspect-square overflow-hidden"
      style={{ backgroundColor: "#0B0B0C" }}
    >
      <span className="absolute left-1.5 top-2 h-px w-6" style={{ backgroundColor: "#C9A15A" }} />
      <span
        className="absolute bottom-2 right-1.5 h-px w-8"
        style={{ backgroundColor: "rgba(201,161,90,0.5)" }}
      />
    </span>
  );
}

export function LandingEditor({ initial }: LandingEditorProps) {
  const { user } = useAuth();
  const canEdit = user != null;
  const [content, setContent] = useState(() => withNormalizedHeroLayout(initial));
  const [saved, setSaved] = useState(() => withNormalizedHeroLayout(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const next = withNormalizedHeroLayout(initial);
    setContent(next);
    setSaved(next);
  }, [initial]);

  const dirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(saved),
    [content, saved],
  );

  function updateField<K extends keyof DojangLandingContent>(
    key: K,
    value: DojangLandingContent[K],
  ) {
    setContent((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  }

  function validateImages(): string | null {
    if (content.heroImageUrl && !isHttpUrl(content.heroImageUrl)) {
      return "대표 사진은 http(s) 이미지 주소여야 합니다.";
    }
    if (content.logoUrl && !isHttpUrl(content.logoUrl)) {
      return "로고는 http(s) 이미지 주소여야 합니다.";
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      return;
    }

    setError(null);
    setSuccess(null);

    const imageError = validateImages();
    if (imageError) {
      setError(imageError);
      return;
    }

    if (!content.name.trim()) {
      setError("도장 이름을 입력해 주세요.");
      return;
    }

    setSaving(true);

    try {
      const next = await updateMyDojang({
        name: content.name.trim(),
        description: content.description?.trim() || null,
        logoUrl: content.logoUrl,
        heroImageUrl: content.heroImageUrl,
        brandColor: normalizeHexColor(
          content.brandColor,
          DEFAULT_BRAND_COLOR,
        ),
        heroLayout: content.heroLayout,
        headingFont: content.headingFont,
      });
      setContent(next);
      setSaved(next);
      setSuccess("랜딩페이지를 저장했습니다. 공개 주소에서 바로 확인할 수 있습니다.");
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
              이름, 소개, 사진만 넣으면 공개 홍보 페이지가 바로 바뀝니다.
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

        {!canEdit ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            로그인 정보를 확인하는 중입니다...
          </p>
        ) : null}

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            도장 이름
            <input
              name="name"
              required
              disabled={!canEdit}
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
              disabled={!canEdit}
              value={content.description ?? ""}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className={inputClassName}
              placeholder="우리 체육관을 한두 문장으로 소개해 주세요."
            />
          </label>

          <ImageField
            label="대표 사진"
            hint="파일을 올리거나 https 이미지 주소를 붙여넣으세요."
            value={content.heroImageUrl}
            disabled={!canEdit}
            onChange={(next) => updateField("heroImageUrl", next)}
          />

          <ImageField
            label="로고"
            hint="정사각형 이미지가 가장 잘 맞습니다."
            value={content.logoUrl}
            disabled={!canEdit}
            onChange={(next) => updateField("logoUrl", next)}
          />

          <fieldset>
            <legend className="text-sm font-medium">홈페이지 디자인</legend>
            <p className="mt-1 text-xs text-zinc-500">
              히어로부터 아래 섹션 구성까지 페이지 전체가 함께 바뀌어요.
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {HERO_LAYOUTS.map((layout) => {
                const selected = content.heroLayout === layout;
                return (
                  <button
                    key={layout}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => updateField("heroLayout", layout)}
                    className={`overflow-hidden rounded-lg border text-left disabled:opacity-50 ${
                      selected
                        ? "border-zinc-900 ring-2 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                    aria-pressed={selected}
                  >
                    <HeroLayoutThumb
                      layout={layout}
                      brand={normalizeHexColor(
                        content.brandColor,
                        DEFAULT_BRAND_COLOR,
                      )}
                    />
                    <span className="block truncate px-1.5 py-1 text-center text-[11px] font-medium text-zinc-600">
                      {HERO_LAYOUT_LABELS[layout]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">헤드라인 폰트</legend>
            <p className="mt-1 text-xs text-zinc-500">
              도장 이름과 섹션 제목에 적용돼요. 나머지 글씨는 그대로예요.
            </p>
            <div className="mt-2 space-y-2">
              {HEADING_FONTS.map((font) => {
                const selected = content.headingFont === font;
                return (
                  <button
                    key={font}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => updateField("headingFont", font)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left disabled:opacity-50 ${
                      selected
                        ? "border-zinc-900 ring-2 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                    aria-pressed={selected}
                  >
                    <span
                      className="truncate text-lg"
                      style={{ fontFamily: HEADING_FONT_VARS[font] }}
                    >
                      {content.name.trim() || "미리보기"}
                    </span>
                    <span className="ml-3 shrink-0 text-xs font-medium text-zinc-500">
                      {HEADING_FONT_LABELS[font]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">브랜드 컬러</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                type="color"
                name="brand_color"
                disabled={!canEdit}
                value={normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR)}
                onChange={(event) =>
                  updateField("brandColor", event.target.value)
                }
                className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-white p-1 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                disabled={!canEdit}
                value={content.brandColor || DEFAULT_BRAND_COLOR}
                onChange={(event) =>
                  updateField("brandColor", event.target.value)
                }
                className="w-28 rounded-lg border border-zinc-300 px-2 py-2 text-sm uppercase disabled:bg-zinc-50"
                spellCheck={false}
              />
              {BRAND_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => updateField("brandColor", preset.value)}
                  className="h-8 w-8 rounded-full border border-zinc-200 disabled:opacity-50"
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

          <button
            type="submit"
            disabled={!canEdit || saving || !dirty}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 sm:w-auto"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </section>

      <section className="xl:sticky xl:top-4">
        <p className="mb-3 text-sm font-medium text-zinc-600">실시간 미리보기</p>
        <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm max-xl:max-h-[70vh] max-xl:overflow-y-auto xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className="pointer-events-none">
            <DojangLanding content={content} preview />
          </div>
        </div>
      </section>
    </div>
  );
}
