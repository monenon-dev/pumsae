import { HeroLayoutSwitch } from "@/components/hero-layouts";
import { TrialRequestForm } from "@/components/TrialRequestForm";
import {
  DEFAULT_BRAND_COLOR,
  HEADING_FONT_VARS,
  type DojangLandingContent,
} from "@/types/dojang";
import {
  getReadableTextColor,
  hexToRgba,
  landingCssVars,
  normalizeHexColor,
} from "@/lib/dojang/brand";

type TemplateProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

function ProgramBlock({
  title,
  description,
  brand,
}: {
  title: string;
  description: string;
  brand: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rotate-12"
        style={{ backgroundColor: hexToRgba(brand, 0.25) }}
      />
      <h3 className="relative text-lg font-black uppercase tracking-tight text-white">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

export function DynamicTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <article
      className="min-h-full bg-black text-white"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className="px-5 py-14 sm:px-8">
        <h2
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--landing-brand)", fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          Program
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProgramBlock
            title="유치부"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
            brand={brand}
          />
          <ProgramBlock
            title="초등 · 중고등"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
            brand={brand}
          />
          <ProgramBlock
            title="성인반"
            description="체력과 자기 관리를 위한 성인 수련 자리입니다."
            brand={brand}
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="relative overflow-hidden px-5 py-16 sm:px-8"
        style={{ backgroundColor: "var(--landing-brand)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rotate-12 bg-black/20"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-black uppercase tracking-[0.3em] opacity-80"
            style={{ color: "var(--landing-brand-fg)" }}
          >
            Trial Class
          </p>
          <h2
            className="mt-2 text-3xl font-black uppercase tracking-tight"
            style={{
              color: "var(--landing-brand-fg)",
              fontFamily: HEADING_FONT_VARS[content.headingFont],
            }}
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
