"use client";

import { apiFetch, apiJson, readJson, throwIfNotOk } from "@/lib/api/client";
import { ApiError, getApiUrl } from "@/lib/api/types";
import type { AlbumDetail, AlbumPhoto, AlbumSummary } from "@/types/album";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function fetchAlbums(): Promise<AlbumSummary[]> {
  return apiJson<AlbumSummary[]>("/dashboard/albums");
}

export async function fetchAlbum(id: string): Promise<AlbumDetail> {
  return apiJson<AlbumDetail>(`/dashboard/albums/${encodeURIComponent(id)}`);
}

export async function createAlbum(input: {
  title: string;
  description: string | null;
  takenOn: string | null;
}): Promise<AlbumDetail> {
  return apiJson<AlbumDetail>("/dashboard/albums", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAlbum(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    takenOn: string | null;
    isPublic: boolean;
  }>,
): Promise<AlbumDetail> {
  return apiJson<AlbumDetail>(`/dashboard/albums/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAlbum(id: string): Promise<void> {
  await apiJson<void>(`/dashboard/albums/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function uploadAlbumPhoto(albumId: string, file: File): Promise<AlbumPhoto> {
  const contentType = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new ApiError(`${file.name}: jpg, png, webp 사진만 올릴 수 있어요.`, 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(`${file.name}: 10MB 이하 사진만 올릴 수 있어요.`, 413);
  }

  const body = new FormData();
  body.append("file", file);
  const response = await apiFetch(`/dashboard/albums/${encodeURIComponent(albumId)}/photos`, {
    method: "POST",
    body,
  });
  await throwIfNotOk(response, "사진을 올리지 못했습니다.");
  return readJson<AlbumPhoto>(response);
}

export async function deleteAlbumPhoto(albumId: string, photoId: string): Promise<void> {
  await apiJson<void>(
    `/dashboard/albums/${encodeURIComponent(albumId)}/photos/${encodeURIComponent(photoId)}`,
    { method: "DELETE" },
  );
}

/** 공개 홈페이지용(로그인 없음). 공개 앨범 중 사진이 있는 것만 온다. */
export async function fetchPublicAlbums(slug: string): Promise<AlbumSummary[]> {
  const response = await fetch(`${getApiUrl()}/dojangs/${encodeURIComponent(slug)}/albums`);
  if (!response.ok) return [];
  return (await response.json()) as AlbumSummary[];
}

export async function fetchPublicAlbum(slug: string, albumId: string): Promise<AlbumDetail> {
  const response = await fetch(
    `${getApiUrl()}/dojangs/${encodeURIComponent(slug)}/albums/${encodeURIComponent(albumId)}`,
  );
  if (!response.ok) {
    throw new ApiError("앨범을 불러오지 못했어요.", response.status);
  }
  return (await response.json()) as AlbumDetail;
}
