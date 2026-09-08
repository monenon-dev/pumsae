"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/types";
import { uploadImage } from "@/lib/api/uploads";
import { isHttpUrl } from "@/lib/dojang/url";

type ImageFieldProps = {
  label: string;
  hint?: string;
  value: string | null;
  disabled?: boolean;
  onChange: (next: string | null) => void;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500";

export function ImageField({
  label,
  hint = "파일을 올리거나 이미지 주소를 붙여넣으세요.",
  value,
  disabled = false,
  onChange,
}: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = value ?? "";
  const previewable = url.length > 0 && isHttpUrl(url);

  async function handleFile(file: File | undefined) {
    if (!file || disabled) {
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const publicUrl = await uploadImage(file);
      onChange(publicUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiError
          ? uploadError.message
          : "이미지를 올리지 못했습니다.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          {previewable ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
              미리보기
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void handleFile(file);
            }}
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-60"
          />
          <input
            type="url"
            value={url}
            disabled={disabled || uploading}
            onChange={(event) => {
              setError(null);
              onChange(event.target.value || null);
            }}
            className={inputClassName}
            placeholder="https://..."
          />
          <p className="text-sm text-zinc-500">
            {uploading ? "올리는 중..." : hint}
          </p>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </fieldset>
  );
}
