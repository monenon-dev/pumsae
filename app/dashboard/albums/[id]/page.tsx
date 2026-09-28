"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PhotoLightbox } from "@/components/albums/PhotoLightbox";
import {
  deleteAlbum,
  deleteAlbumPhoto,
  fetchAlbum,
  updateAlbum,
  uploadAlbumPhoto,
} from "@/lib/api/albums";
import { formatTakenOn, type AlbumDetail } from "@/types/album";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-zinc-900 focus:border-zinc-900 focus:ring-1";

type UploadProgress = { done: number; total: number; failed: string[] };

export default function AlbumDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", takenOn: "", description: "" });
  const [upload, setUpload] = useState<UploadProgress | null>(null);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [savingPublic, setSavingPublic] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAlbum(params.id)
      .then((data) => {
        if (!cancelled) setAlbum(data);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "앨범을 불러오지 못했습니다.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <section>
        <Link href="/dashboard/albums" className="text-sm text-zinc-600 underline">
          ← 사진첩
        </Link>
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      </section>
    );
  }

  if (!album) {
    return <p className="text-sm text-zinc-500">불러오는 중...</p>;
  }

  const current = album;

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const progress: UploadProgress = { done: 0, total: list.length, failed: [] };
    setUpload({ ...progress });
    // 한 장씩 차례로 올린다. 올라간 사진은 바로 격자에 붙는다.
    for (const file of list) {
      try {
        const photo = await uploadAlbumPhoto(current.id, file);
        setAlbum((prev) =>
          prev
            ? {
                ...prev,
                photos: [...prev.photos, photo],
                photoCount: prev.photoCount + 1,
                coverUrl: prev.coverUrl ?? photo.thumbUrl,
              }
            : prev,
        );
      } catch (uploadError) {
        progress.failed.push(
          uploadError instanceof Error ? uploadError.message : `${file.name}: 올리지 못했어요.`,
        );
      }
      progress.done += 1;
      setUpload({ ...progress, failed: [...progress.failed] });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (progress.failed.length === 0) {
      window.setTimeout(() => setUpload(null), 1500);
    }
  }

  async function togglePublic() {
    setSavingPublic(true);
    try {
      setAlbum(await updateAlbum(current.id, { isPublic: !current.isPublic }));
    } catch (toggleError) {
      window.alert(toggleError instanceof Error ? toggleError.message : "공개 설정을 바꾸지 못했습니다.");
    } finally {
      setSavingPublic(false);
    }
  }

  async function saveInfo() {
    if (!draft.title.trim()) {
      window.alert("앨범 이름을 입력해 주세요.");
      return;
    }
    try {
      setAlbum(
        await updateAlbum(current.id, {
          title: draft.title.trim(),
          takenOn: draft.takenOn || null,
          description: draft.description.trim() || null,
        }),
      );
      setEditing(false);
    } catch (saveError) {
      window.alert(saveError instanceof Error ? saveError.message : "저장하지 못했습니다.");
    }
  }

  async function removePhoto(photoId: string) {
    if (!window.confirm("이 사진을 앨범에서 지울까요?")) return;
    try {
      await deleteAlbumPhoto(current.id, photoId);
      setAlbum((prev) => {
        if (!prev) return prev;
        const photos = prev.photos.filter((photo) => photo.id !== photoId);
        return { ...prev, photos, photoCount: photos.length, coverUrl: photos[0]?.thumbUrl ?? null };
      });
      setViewIndex(null);
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "사진을 지우지 못했습니다.");
    }
  }

  async function removeAlbum() {
    if (!window.confirm(`"${current.title}" 앨범과 사진 ${current.photoCount}장을 모두 지울까요?`)) {
      return;
    }
    try {
      await deleteAlbum(current.id);
      router.replace("/dashboard/albums");
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "앨범을 지우지 못했습니다.");
    }
  }

  const uploading = upload !== null && upload.done < upload.total;

  return (
    <section className="space-y-6">
      <Link href="/dashboard/albums" className="text-sm text-zinc-600 underline">
        ← 사진첩
      </Link>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        {editing ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              앨범 이름
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                maxLength={80}
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium">
              찍은 날
              <input
                type="date"
                value={draft.takenOn}
                onChange={(event) => setDraft({ ...draft, takenOn: event.target.value })}
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium">
              설명
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                maxLength={1000}
                className={inputClassName}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void saveInfo()}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{current.title}</h1>
              <p className="mt-1 text-sm text-zinc-500">
                {[formatTakenOn(current.takenOn), `사진 ${current.photoCount}장`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {current.description ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                  {current.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft({
                    title: current.title,
                    takenOn: current.takenOn ?? "",
                    description: current.description ?? "",
                  });
                  setEditing(true);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                정보 수정
              </button>
              <button
                type="button"
                onClick={() => void removeAlbum()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                앨범 삭제
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3">
          <button
            type="button"
            role="switch"
            aria-checked={current.isPublic}
            disabled={savingPublic}
            onClick={() => void togglePublic()}
            className="flex items-center gap-2 text-sm font-medium text-zinc-800 disabled:opacity-60"
          >
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                current.isPublic ? "bg-pumsae-accent" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  current.isPublic ? "translate-x-[1.125rem]" : "translate-x-0.5"
                }`}
              />
            </span>
            학부모에게 공개
          </button>
          <p className="text-xs text-zinc-500">
            {current.isPublic
              ? "홈페이지 사진첩에 보이고 있어요."
              : "아이들 얼굴이 나온 사진은 보호자 동의를 확인한 뒤 공개해 주세요."}
          </p>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">사진</h2>
          <label
            className={`inline-flex cursor-pointer items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? `올리는 중 ${upload?.done}/${upload?.total}` : "+ 사진 올리기"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => void uploadFiles(event.target.files)}
            />
          </label>
        </div>

        {upload ? (
          <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-zinc-900 transition-all"
                style={{ width: `${(upload.done / upload.total) * 100}%` }}
              />
            </div>
            <p className="mt-2">
              {upload.done}/{upload.total}장 처리했어요
              {upload.failed.length > 0 ? ` · ${upload.failed.length}장 실패` : ""}
            </p>
            {upload.failed.length > 0 ? (
              <ul className="mt-1 list-inside list-disc text-xs text-red-700">
                {upload.failed.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            ) : null}
            {!uploading && upload.failed.length > 0 ? (
              <button
                type="button"
                onClick={() => setUpload(null)}
                className="mt-2 text-xs font-medium underline"
              >
                닫기
              </button>
            ) : null}
          </div>
        ) : null}

        {current.photos.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600">
            아직 사진이 없어요. 여러 장을 한 번에 골라 올릴 수 있어요.
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
            {current.photos.map((photo, index) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setViewIndex(index)}
                  className="block aspect-square w-full overflow-hidden rounded-lg bg-zinc-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover hover:opacity-90"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewIndex !== null ? (
        <PhotoLightbox
          photos={current.photos}
          index={viewIndex}
          title={current.title}
          onIndexChange={setViewIndex}
          onClose={() => setViewIndex(null)}
          footer={
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => void removePhoto(current.photos[viewIndex].id)}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-white/20"
              >
                이 사진 지우기
              </button>
            </div>
          }
        />
      ) : null}
    </section>
  );
}
