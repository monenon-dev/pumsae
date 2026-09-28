"use client";

import { useEffect, useState } from "react";
import { PromoCard } from "@/components/templates/PromoCard";
import { ScaledFrame } from "@/components/ui/ScaledFrame";
import { sectionPaddingClass } from "@/lib/dojang/brand";
import { getCopy } from "@/lib/dojang/copy";
import { useDojangNews } from "@/lib/dojang/news-context";
import { HEADING_FONT_VARS, type DojangLandingContent } from "@/types/dojang";
import {
  PROMO_CARD_SIZE,
  type PromoTemplateContent,
} from "@/types/promo-template";

// 1080px 카드를 부모 폭에 맞게 줄여 그린다.
function ScaledPromoCard({ content }: { content: PromoTemplateContent }) {
  return (
    <ScaledFrame baseWidth={PROMO_CARD_SIZE} aspectRatio="1 / 1">
      <PromoCard content={content} />
    </ScaledFrame>
  );
}

/**
 * 관장님이 "홈페이지에 공개"로 고른 카드뉴스를 보여주는 섹션. 소식이 없으면
 * 아무것도 그리지 않는다. 글자색은 각 디자인의 섹션 색을 그대로 따른다.
 */
export function DojangNewsSection({
  content,
}: {
  content: DojangLandingContent;
}) {
  const news = useDojangNews();
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = news.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    if (!opened) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opened]);

  if (news.length === 0) {
    return null;
  }

  return (
    <section
      className={`border-t px-5 sm:px-8 ${sectionPaddingClass(content.sectionSpacing, "py-14")}`}
      style={{
        borderColor: "color-mix(in srgb, currentColor 12%, transparent)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--landing-brand)" }}
        >
          {getCopy(content, "newsEyebrow", "News")}
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "newsTitle", "우리 도장 소식")}
        </h2>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {news.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                aria-label={`${item.content.title} 크게 보기`}
                className="block w-full overflow-hidden rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ScaledPromoCard content={item.content} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {opened ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={opened.content.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-[min(90vw,80vh)] overflow-hidden rounded-xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <ScaledPromoCard content={opened.content} />
          </div>
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-zinc-900"
          >
            닫기
          </button>
        </div>
      ) : null}
    </section>
  );
}
