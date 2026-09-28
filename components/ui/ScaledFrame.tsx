"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * children을 baseWidth(px) 폭으로 실제처럼 그린 뒤, 이 칸의 폭에 맞게 통째로
 * 줄여 보여준다. 칸 높이는 aspectRatio로 정하고 넘치는 부분은 잘린다.
 * (페이지 미리보기, 1080px 카드뉴스 썸네일 등)
 */
export function ScaledFrame({
  baseWidth,
  aspectRatio,
  className = "",
  children,
}: {
  baseWidth: number;
  aspectRatio: string;
  className?: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / baseWidth);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [baseWidth]);

  return (
    <div
      ref={frameRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left select-none"
        // 폭을 재기 전(scale 0)에는 숨겨서 큰 원본이 잠깐 비치지 않게 한다.
        style={{ width: baseWidth, transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}
