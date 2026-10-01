"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createAlbum, fetchAlbums } from "@/lib/api/albums";
import { formatTakenOn, type AlbumSummary } from "@/types/album";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

function NewAlbumDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [takenOn, setTakenOn] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("앨범 이름을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const album = await createAlbum({
        title: title.trim(),
        takenOn: takenOn || null,
        description: description.trim() || null,
      });
      router.push(`/dashboard/albums/${album.id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "앨범을 만들지 못했습니다.");
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="새 앨범"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold">새 앨범</h2>
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            앨범 이름
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              className={inputClassName}
              placeholder="예: 10월 승급 심사, 여름 캠프"
            />
          </label>
          <label className="block text-sm font-medium">
            찍은 날 (선택)
            <input
              type="date"
              value={takenOn}
              onChange={(event) => setTakenOn(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="block text-sm font-medium">
            설명 (선택)
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              className={inputClassName}
            />
          </label>
          <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-600">
            새 앨범은 비공개로 시작해요. 사진을 확인한 뒤 앨범 화면에서
            &quot;학부모에게 공개&quot;를 켜면 홈페이지 사진첩에 보여요.
          </p>
        </div>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "만드는 중..." : "만들고 사진 올리기"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAlbums()
      .then((rows) => {
        if (!cancelled) setAlbums(rows);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "앨범을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">사진첩</h1>
          <p className="mt-2 text-sm text-zinc-600">
            수업과 행사 사진을 앨범으로 모아 두세요. 공개한 앨범만 홈페이지에 보여요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          + 새 앨범
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : loading ? (
        <p className="mt-8 text-sm text-zinc-500">불러오는 중...</p>
      ) : albums.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-600">아직 만든 앨범이 없어요.</p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-3 text-sm font-medium text-zinc-900 underline"
          >
            첫 앨범 만들기
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albums.map((album) => (
            <li key={album.id}>
              <Link href={`/dashboard/albums/${album.id}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                  {album.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                      사진 없음
                    </div>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      album.isPublic ? "bg-pumsae-accent text-pure-white" : "bg-white/90 text-zinc-700"
                    }`}
                  >
                    {album.isPublic ? "공개" : "비공개"}
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold">{album.title}</p>
                <p className="text-xs text-zinc-500">
                  {[formatTakenOn(album.takenOn), `사진 ${album.photoCount}장`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {creating ? <NewAlbumDialog onClose={() => setCreating(false)} /> : null}
    </section>
  );
}
