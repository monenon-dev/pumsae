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

function ProgramRow({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-2 border-t border-zinc-200 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6">
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--landing-brand)" }}
      >
        {label}
      </p>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SolidTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const spacing = content.sectionSpacing;

  return (
    <article
      className="min-h-full bg-white text-zinc-900"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className={`mx-auto max-w-2xl px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}>
        <h2
          className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "programEyebrow", "Program")}
        </h2>
        <div className="mt-2">
          <ProgramRow
            label={getCopy(content, "class1Title", "유치부")}
            title={getCopy(content, "class1Headline", "처음 만나는 태권도")}
            description={getCopy(
              content,
              "class1Desc",
              "처음 태권도를 접하는 아이들을 위한 기초 수련.",
            )}
          />
          <ProgramRow
            label={getCopy(content, "class2Title", "초등·중고등")}
            title={getCopy(content, "class2Headline", "기본기부터 겨루기까지")}
            description={getCopy(
              content,
              "class2Desc",
              "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
            )}
          />
          <ProgramRow
            label={getCopy(content, "class3Title", "성인반")}
            title={getCopy(content, "class3Headline", "체력과 자기 관리")}
            description={getCopy(
              content,
              "class3Desc",
              "퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다.",
            )}
          />
          <div className="border-t border-zinc-200" />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className={`border-t border-zinc-200 px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--landing-brand)" }}
          >
            {getCopy(content, "ctaEyebrow", "Trial Class")}
          </p>
          <h2
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            {getCopy(content, "ctaTitle", "우리 체육관, 먼저 체험해 보세요")}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
            {getCopy(
              content,
              "ctaDescription",
              "방문 전 체험 수업을 신청하면 관장님이 일정과 안내를 도와드립니다.",
            )}
          </p>
          <div className="mt-7">
            <TrialRequestForm dojangId={content.id} disabled={preview} />
          </div>
        </div>
      </section>
    </article>
  );
}
