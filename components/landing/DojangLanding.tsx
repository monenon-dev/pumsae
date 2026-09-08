import type { CSSProperties } from "react";
import {
  DEFAULT_BRAND_COLOR,
  type DojangLandingContent,
} from "@/types/dojang";
import {
  getReadableTextColor,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";

type DojangLandingProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

function ClassPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        반 소개
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
      <p className="mt-4 text-sm text-zinc-400">
        시간표와 수강 안내는 곧 연결됩니다.
      </p>
    </div>
  );
}

export function DojangLanding({
  content,
  preview = false,
}: DojangLandingProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const trialHref = preview ? undefined : "#trial";
  const location = [content.region, content.address].filter(Boolean).join(" ");

  return (
    <article
      className="min-h-full bg-zinc-50 text-zinc-900"
      style={
        {
          "--landing-brand": brand,
          "--landing-brand-fg": brandFg,
          "--landing-brand-soft": hexToRgba(brand, 0.16),
        } as CSSProperties
      }
    >
      <header className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden bg-zinc-900">
        {content.heroImageUrl ? (
          // User-provided URLs can be any host, so native img is used on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${brand} 0%, #111827 70%)`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${hexToRgba("#000000", 0.72)} 0%, ${hexToRgba(brand, 0.28)} 48%, ${hexToRgba("#000000", 0.2)} 100%)`,
          }}
        />
        <div className="relative z-10 px-5 pb-8 pt-16 sm:px-8 sm:pb-10">
          {content.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.logoUrl}
              alt={`${content.name} 로고`}
              className="mb-4 h-14 w-14 rounded-full border border-white/40 bg-white object-cover shadow-sm sm:h-16 sm:w-16"
            />
          ) : null}
          {location ? (
            <p className="mb-2 text-xs font-medium tracking-wide text-white/80">
              {location}
            </p>
          ) : null}
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {content.name || "도장 이름"}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
            {content.description ||
              "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다."}
          </p>
          {content.phone ? (
            <p className="mt-3 text-sm text-white/80">문의 {content.phone}</p>
          ) : null}
          {trialHref ? (
            <a
              href={trialHref}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: "var(--landing-brand)",
                color: "var(--landing-brand-fg)",
              }}
            >
              체험 신청하기
            </a>
          ) : (
            <span
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: "var(--landing-brand)",
                color: "var(--landing-brand-fg)",
              }}
            >
              체험 신청하기
            </span>
          )}
        </div>
      </header>

      <section className="px-5 py-10 sm:px-8">
        <p className="text-xs font-semibold tracking-wide text-zinc-500">
          KIDS / TEENS
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          유치부 · 초중고
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          아이부터 청소년까지, 또래와 함께 수련하는 반입니다.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ClassPlaceholder
            title="유치부"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
          />
          <ClassPlaceholder
            title="초등 · 중고등"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
          />
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--landing-brand-soft)] px-5 py-10 sm:px-8">
        <p className="text-xs font-semibold tracking-wide text-zinc-500">
          ADULT
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">성인반</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          체력과 자기 관리를 위한 성인 수련 자리입니다.
        </p>
        <div className="mt-5">
          <ClassPlaceholder
            title="성인 저녁반"
            description="퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다."
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="px-5 py-12 text-center sm:px-8"
      >
        <h2 className="text-2xl font-semibold tracking-tight">
          우리 체육관, 먼저 체험해 보세요
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          학부모 체험 신청 폼은 다음 단계에서 이 버튼에 연결됩니다.
        </p>
        {trialHref ? (
          <a
            href={trialHref}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor: "var(--landing-brand)",
              color: "var(--landing-brand-fg)",
            }}
          >
            체험 신청하기
          </a>
        ) : (
          <span
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold"
            style={{
              backgroundColor: "var(--landing-brand)",
              color: "var(--landing-brand-fg)",
            }}
          >
            체험 신청하기
          </span>
        )}
      </section>
    </article>
  );
}
