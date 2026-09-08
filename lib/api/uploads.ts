"use client";

import { apiFetch, readJson, throwIfNotOk } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export async function uploadImage(file: File): Promise<string> {
  const contentType = file.type === "image/jpg" ? "image/jpeg" : file.type;

  if (!ALLOWED_TYPES.has(contentType)) {
    throw new ApiError("jpg, jpeg, png, webp 이미지만 올릴 수 있습니다.", 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError("이미지는 10MB 이하만 올릴 수 있습니다.", 413);
  }

  const body = new FormData();
  body.append("file", file);

  const response = await apiFetch("/uploads", {
    method: "POST",
    body,
  });
  await throwIfNotOk(response, "이미지를 올리지 못했습니다.");
  const payload = await readJson<{ url?: string }>(response);
  if (!payload.url) {
    throw new ApiError("이미지를 올리지 못했습니다.", 502);
  }
  return payload.url;
}
