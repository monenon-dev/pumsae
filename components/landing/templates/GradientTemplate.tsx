import { HeroLayoutSwitch } from "@/components/hero-layouts";
import { TrialRequestForm } from "@/components/TrialRequestForm";
import {
  DEFAULT_BRAND_COLOR,
  HEADING_FONT_VARS,
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

function ClassCard({
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

export function GradientTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <article
      className="min-h-full bg-zinc-50 text-zinc-900"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className="px-5 py-10 sm:px-8">
        <p
          className="text-xs font-semibold tracking-wide"
          style={{ color: "var(--landing-brand)" }}
        >
          KIDS / TEENS
        </p>
        <h2
          className="mt-1 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          유치부 · 초중고
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          아이부터 청소년까지, 또래와 함께 수련하는 반입니다.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ClassCard
            title="유치부"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
          />
          <ClassCard
            title="초등 · 중고등"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
          />
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--landing-brand-soft)] px-5 py-10 sm:px-8">
        <p
          className="text-xs font-semibold tracking-wide"
          style={{ color: "var(--landing-brand)" }}
        >
          ADULT
        </p>
        <h2
          className="mt-1 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          성인반
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          체력과 자기 관리를 위한 성인 수련 자리입니다.
        </p>
        <div className="mt-5">
          <ClassCard
            title="성인 저녁반"
            description="퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다."
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="px-5 py-12 sm:px-8"
      >
        <div
          className="mx-auto max-w-2xl rounded-[1.75rem] px-6 py-10 text-center shadow-sm sm:px-10"
          style={{
            backgroundColor: "var(--landing-brand)",
            color: "var(--landing-brand-fg)",
          }}
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
            Trial Class
          </p>
          <h2
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            우리 체육관, 먼저 체험해 보세요
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-90">
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
