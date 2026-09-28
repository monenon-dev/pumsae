"use client";

import { useEffect, useRef } from "react";
import type { AlbumPhoto } from "@/types/album";

/**
 * 사진을 화면 가득 크게 보여준다. 좌우 버튼·방향키·밀기로 넘기고, ESC나
 * 바깥을 누르면 닫힌다. 대시보드와 공개 홈페이지가 같이 쓴다.
 */
export function PhotoLightbox({
  photos,
  index,
  title,
  onIndexChange,
  onClose,
  footer,
}: {
  photos: AlbumPhoto[];
  index: number;
  title?: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  const touchStartX = useRef<number | null>(null);
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (event.key === "ArrowRight" && index < photos.length - 1) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [index, onClose, onIndexChange, photos.length]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "사진 크게 보기"}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white"
      onClick={onClose}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start == null || end == null || Math.abs(end - start) < 50) return;
        if (end < start && hasNext) onIndexChange(index + 1);
        if (end > start && hasPrev) onIndexChange(index - 1);
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <p className="min-w-0 truncate font-medium">
          {title ? `${title} · ` : ""}
          {index + 1} / {photos.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/15 px-3 py-1.5 font-semibold hover:bg-white/25"
        >
          닫기
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2">
        {/* 사용자 사진은 R2 등 임의 호스트라 일부러 native img를 쓴다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photo.id}
          src={photo.url}
          alt=""
          className="max-h-full max-w-full select-none object-contain"
          onClick={(event) => event.stopPropagation()}
          draggable={false}
        />
        {hasPrev ? (
          <button
            type="button"
            aria-label="이전 사진"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange(index - 1);
            }}
            className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl hover:bg-white/25 sm:flex"
          >
            ‹
          </button>
        ) : null}
        {hasNext ? (
          <button
            type="button"
            aria-label="다음 사진"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange(index + 1);
            }}
            className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl hover:bg-white/25 sm:flex"
          >
            ›
          </button>
        ) : null}
      </div>

      {footer ? (
        <div className="px-4 pb-4" onClick={(event) => event.stopPropagation()}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
