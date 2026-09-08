"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateDojangLanding } from "@/app/dashboard/landing/actions";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { createClient } from "@/lib/supabase/client";
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

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 sm:w-auto"
    >
      {pending ? "저장 중..." : "저장하기"}
    </button>
  );
}

export function LandingEditor({ initial }: LandingEditorProps) {
  const [content, setContent] = useState(initial);
  const [uploading, setUploading] = useState<"logo" | "hero" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [state, formAction] = useFormState(updateDojangLanding, {});

  const previewContent = useMemo(() => content, [content]);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  function updateField<K extends keyof DojangLandingContent>(
    key: K,
    value: DojangLandingContent[K],
  ) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(kind: "logo" | "hero", file: File) {
    const field = kind === "logo" ? "logoUrl" : "heroImageUrl";
    const previous = content[field];
    setUploadError(null);
    setUploading(kind);

    const objectUrl = URL.createObjectURL(file);
    updateField(field, objectUrl);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${content.id}/${kind}-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("dojang-media")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from("dojang-media").getPublicUrl(path);
      updateField(field, data.publicUrl);
    } catch {
      updateField(field, previous);
      setUploadError(
        "사진 업로드에 실패했습니다. Storage 버킷(dojang-media)을 만들었는지 확인하거나, 이미지 주소를 붙여넣어 주세요.",
      );
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(null);
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

        <form action={formAction} className="mt-6 space-y-4">
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
            <label className="block text-sm text-zinc-600">
              사진 올리기
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage("hero", file);
                  }
                }}
              />
            </label>
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
            <label className="block text-sm text-zinc-600">
              로고 올리기
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadImage("logo", file);
                  }
                }}
              />
            </label>
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

          {uploading ? (
            <p className="text-sm text-zinc-500">
              {uploading === "hero" ? "대표 사진" : "로고"} 올리는 중...
            </p>
          ) : null}
          {uploadError ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {uploadError}
            </p>
          ) : null}
          {state.error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {state.success}
            </p>
          ) : null}

          <SaveButton disabled={Boolean(uploading)} />
        </form>
      </section>

      <section className="xl:sticky xl:top-4">
        <p className="mb-3 text-sm font-medium text-zinc-600">실시간 미리보기</p>
        <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm max-xl:max-h-[70vh] max-xl:overflow-y-auto xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div className={uploading ? "pointer-events-none opacity-80" : "pointer-events-none"}>
            <DojangLanding content={previewContent} preview />
          </div>
        </div>
      </section>
    </div>
  );
}
