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
  sectionPaddingClass,
} from "@/lib/dojang/brand";
import { getCopy } from "@/lib/dojang/copy";

type TemplateProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

function ProgramColumn({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-l-2 border-zinc-900 pl-4">
      <p className="text-xs font-semibold tabular-nums text-zinc-400">{index}</p>
      <h3 className="mt-1 text-lg font-semibold uppercase tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

export function MonoTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const spacing = content.sectionSpacing;

  return (
    <article
      className="min-h-full bg-white text-zinc-900"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section
        className={`mx-3 mt-5 border-2 border-zinc-900 px-5 sm:mx-5 sm:px-8 ${sectionPaddingClass(spacing, "py-12")}`}
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
          {getCopy(content, "programEyebrow", "Program")}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <ProgramColumn
            index="01"
            title={getCopy(content, "class1Title", "유치부")}
            description={getCopy(
              content,
              "class1Desc",
              "처음 태권도를 접하는 아이들을 위한 기초 수련.",
            )}
          />
          <ProgramColumn
            index="02"
            title={getCopy(content, "class2Title", "초등 · 중고등")}
            description={getCopy(
              content,
              "class2Desc",
              "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
            )}
          />
          <ProgramColumn
            index="03"
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
        className={`mx-3 my-5 border-2 border-zinc-900 bg-zinc-900 px-5 text-white sm:mx-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--landing-brand)" }}
          >
            {getCopy(content, "ctaEyebrow", "Trial Class")}
          </p>
          <h2
            className="mt-2 text-2xl font-semibold uppercase tracking-tight"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            {getCopy(content, "ctaTitle", "우리 체육관, 먼저 체험해 보세요")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
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
