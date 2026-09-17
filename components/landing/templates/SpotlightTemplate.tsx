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
  sectionPaddingClass,
} from "@/lib/dojang/brand";
import { getCopy } from "@/lib/dojang/copy";

type TemplateProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

const STAGE_INK = "#050507";

function ProgramCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-xl border-t-2 bg-white/[0.04] p-5"
      style={{ borderColor: "var(--landing-brand)" }}
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

export function SpotlightTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const spacing = content.sectionSpacing;

  return (
    <article
      className="min-h-full text-white"
      style={{ ...landingCssVars(brand, brandFg), backgroundColor: STAGE_INK }}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className={`px-5 text-center sm:px-8 ${sectionPaddingClass(spacing, "py-16")}`}>
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--landing-brand)" }}
        >
          {getCopy(content, "programEyebrow", "Program")}
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "spotlightProgramTitle", "단계별 수련 프로그램")}
        </h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
          <ProgramCard
            title={getCopy(content, "class1Title", "유치부")}
            description={getCopy(
              content,
              "class1Desc",
              "처음 태권도를 접하는 아이들을 위한 기초 수련.",
            )}
          />
          <ProgramCard
            title={getCopy(content, "class2Title", "초등 · 중고등")}
            description={getCopy(
              content,
              "class2Desc",
              "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
            )}
          />
          <ProgramCard
            title={getCopy(content, "class3Title", "성인반")}
            description={getCopy(
              content,
              "class3Desc",
              "퇴근 후에도 참여할 수 있는 성인 수업입니다.",
            )}
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className={`relative overflow-hidden px-5 text-center sm:px-8 ${sectionPaddingClass(spacing, "py-16")}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full blur-[80px]"
          style={{ backgroundColor: hexToRgba(brand, 0.35) }}
        />
        <div className="relative mx-auto max-w-md">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--landing-brand)" }}
          >
            {getCopy(content, "ctaEyebrow", "Trial Class")}
          </p>
          <h2
            className="mt-2 text-3xl font-semibold tracking-tight"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            {getCopy(content, "ctaTitle", "우리 체육관, 먼저 체험해 보세요")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {getCopy(
              content,
              "ctaDescription",
              "방문 전 체험 수업을 신청하면 관장님이 일정과 안내를 도와드립니다.",
            )}
          </p>
          <div className="mt-7 text-left">
            <TrialRequestForm dojangId={content.id} disabled={preview} />
          </div>
        </div>
      </section>
    </article>
  );
}
