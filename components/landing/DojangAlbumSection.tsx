"use client";

import { useEffect, useState } from "react";
import { PhotoLightbox } from "@/components/albums/PhotoLightbox";
import { fetchPublicAlbum, fetchPublicAlbums } from "@/lib/api/albums";
import { sectionPaddingClass } from "@/lib/dojang/brand";
import { getCopy } from "@/lib/dojang/copy";
import { formatTakenOn, type AlbumDetail, type AlbumSummary } from "@/types/album";
import { HEADING_FONT_VARS, type DojangLandingContent } from "@/types/dojang";

const INITIAL_ALBUMS = 6;

/**
 * 공개 홈페이지 "사진첩". 관장님이 학부모에게 공개한 앨범(사진 있는 것)만
 * 보이고, 없으면 섹션을 숨긴다. 앨범을 누르면 사진을 넘겨 본다.
 */
export function DojangAlbumSection({
  content,
  preview = false,
}: {
  content: DojangLandingContent;
  preview?: boolean;
}) {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [opened, setOpened] = useState<AlbumDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    void fetchPublicAlbums(content.slug)
      .then((rows) => {
        if (!cancelled) setAlbums(rows);
      })
      .catch(() => {
        // 사진첩은 부가 정보라 불러오지 못해도 페이지는 그대로 둔다.
      });
    return () => {
      cancelled = true;
    };
  }, [content.slug, preview]);

  if (preview || albums.length === 0) {
    return null;
  }

  async function openAlbum(album: AlbumSummary) {
    setLoadingId(album.id);
    try {
      const detail = await fetchPublicAlbum(content.slug, album.id);
      if (detail.photos.length > 0) {
        setIndex(0);
        setOpened(detail);
      }
    } catch {
      window.alert("앨범을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoadingId(null);
    }
  }

  const visible = showAll ? albums : albums.slice(0, INITIAL_ALBUMS);

  return (
    <section
      className={`border-t px-5 sm:px-8 ${sectionPaddingClass(content.sectionSpacing, "py-14")}`}
      style={{ borderColor: "color-mix(in srgb, currentColor 12%, transparent)" }}
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--landing-brand)" }}
        >
          {getCopy(content, "albumEyebrow", "Gallery")}
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "albumTitle", "사진첩")}
        </h2>

        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {visible.map((album) => (
            <li key={album.id}>
              <button
                type="button"
                onClick={() => void openAlbum(album)}
                disabled={loadingId !== null}
                className="group block w-full text-left"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/5 shadow-sm">
                  {album.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {loadingId === album.id ? "여는 중..." : `${album.photoCount}장`}
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold">{album.title}</p>
                {album.takenOn ? (
                  <p className="text-xs opacity-60">{formatTakenOn(album.takenOn)}</p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>

        {albums.length > INITIAL_ALBUMS && !showAll ? (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-full border px-4 py-2 text-sm font-medium"
              style={{ borderColor: "color-mix(in srgb, currentColor 25%, transparent)" }}
            >
              앨범 {albums.length - INITIAL_ALBUMS}개 더 보기
            </button>
          </div>
        ) : null}
      </div>

      {opened ? (
        <PhotoLightbox
          photos={opened.photos}
          index={index}
          title={opened.title}
          onIndexChange={setIndex}
          onClose={() => setOpened(null)}
          footer={
            opened.description ? (
              <p className="mx-auto max-w-2xl whitespace-pre-line text-center text-sm text-white/80">
                {opened.description}
              </p>
            ) : undefined
          }
        />
      ) : null}
    </section>
  );
}
