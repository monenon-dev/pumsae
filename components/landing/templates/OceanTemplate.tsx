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

function ClassCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
        반 소개
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

export function OceanTemplate({ content, preview = false }: TemplateProps) {
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
        className={`px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-10")}`}
        style={{ backgroundColor: "#F0FDFA" }}
      >
        <p className="text-xs font-semibold tracking-wide text-cyan-700">
          {getCopy(content, "oceanEyebrow", "KIDS / TEENS / ADULT")}
        </p>
        <h2
          className="mt-1 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "oceanProgramTitle", "연령별 맞춤 수업")}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
          {getCopy(
            content,
            "oceanProgramIntro",
            "아이부터 성인까지, 단계에 맞는 수련 프로그램을 운영합니다.",
          )}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ClassCard
            title={getCopy(content, "class1Title", "유치부")}
            description={getCopy(
              content,
              "class1Desc",
              "처음 태권도를 접하는 아이들을 위한 기초 수련.",
            )}
          />
          <ClassCard
            title={getCopy(content, "class2Title", "초등 · 중고등")}
            description={getCopy(
              content,
              "class2Desc",
              "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
            )}
          />
          <ClassCard
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
        className={`px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}
      >
        <div
          className="mx-auto max-w-2xl rounded-[1.75rem] px-6 py-10 text-center shadow-sm sm:px-10"
          style={{
            backgroundColor: "var(--landing-brand)",
            color: "var(--landing-brand-fg)",
          }}
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
            {getCopy(content, "ctaEyebrow", "Trial Class")}
          </p>
          <h2
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            {getCopy(content, "ctaTitle", "우리 체육관, 먼저 체험해 보세요")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-90">
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
