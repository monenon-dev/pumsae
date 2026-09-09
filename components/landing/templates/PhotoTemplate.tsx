import { HeroSection } from "@/components/HeroSection";
import { TrialRequestForm } from "@/components/TrialRequestForm";
import {
  DEFAULT_BRAND_COLOR,
  type DojangLandingContent,
} from "@/types/dojang";
import {
  getReadableTextColor,
  landingCssVars,
  normalizeHexColor,
} from "@/lib/dojang/brand";

type TemplateProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

function NumberedItem({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 border-t border-zinc-800 py-6 first:border-t-0">
      <span
        className="shrink-0 text-3xl font-semibold tabular-nums"
        style={{ color: "var(--landing-brand)" }}
      >
        {index}
      </span>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function PhotoTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <article
      className="min-h-full bg-zinc-950 text-white"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroSection content={content} preview={preview} />

      <section className="px-5 py-14 sm:px-8">
        <p
          className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
          style={{ color: "var(--landing-brand)" }}
        >
          &ldquo;
          {content.description ||
            "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다."}
          &rdquo;
        </p>
      </section>

      {content.heroImageUrl ? (
        <section className="relative h-[36vh] w-full overflow-hidden sm:h-[46vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.heroImageUrl}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        </section>
      ) : null}

      <section className="px-5 py-14 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Program
        </p>
        <div className="mt-6">
          <NumberedItem
            index="01"
            title="유치부"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
          />
          <NumberedItem
            index="02"
            title="초등 · 중고등"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
          />
          <NumberedItem
            index="03"
            title="성인반"
            description="퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다."
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="px-5 py-16 sm:px-8"
        style={{ backgroundColor: "var(--landing-brand)" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80"
            style={{ color: "var(--landing-brand-fg)" }}
          >
            Trial Class
          </p>
          <h2
            className="mt-2 text-3xl font-semibold tracking-tight"
            style={{ color: "var(--landing-brand-fg)" }}
          >
            우리 체육관, 먼저 체험해 보세요
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-90"
            style={{ color: "var(--landing-brand-fg)" }}
          >
            방문 전 체험 수업을 신청하면 관장님이 일정과 안내를 도와드립니다.
          </p>
          <div className="mt-7 text-left">
            <TrialRequestForm dojangId={content.id} disabled={preview} />
          </div>
        </div>
      </section>
    </article>
  );
}
