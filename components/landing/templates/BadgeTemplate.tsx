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

const PARCHMENT = "#EDEAE1";
const INK = "#2A2A28";

function CertEntry({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-t py-6" style={{ borderColor: hexToRgba(INK, 0.15) }}>
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold"
        style={{ borderColor: "var(--landing-brand)", color: "var(--landing-brand)" }}
      >
        급
      </span>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: INK }}>
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6" style={{ color: hexToRgba(INK, 0.7) }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function BadgeTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const spacing = content.sectionSpacing;

  return (
    <article
      className="min-h-full"
      style={{ ...landingCssVars(brand, brandFg), backgroundColor: PARCHMENT, color: INK }}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className={`mx-auto max-w-2xl px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}>
        <h2
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--landing-brand)", fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "programEyebrow", "Program")}
        </h2>
        <div className="mt-2">
          <CertEntry
            title={getCopy(content, "class1Title", "유치부")}
            description={getCopy(
              content,
              "class1Desc",
              "처음 태권도를 접하는 아이들을 위한 기초 수련.",
            )}
          />
          <CertEntry
            title={getCopy(content, "class2Title", "초등 · 중고등")}
            description={getCopy(
              content,
              "class2Desc",
              "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
            )}
          />
          <CertEntry
            title={getCopy(content, "class3Title", "성인반")}
            description={getCopy(
              content,
              "class3Desc",
              "퇴근 후에도 참여할 수 있는 성인 수업입니다.",
            )}
          />
          <div className="border-t" style={{ borderColor: hexToRgba(INK, 0.15) }} />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className={`px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}
      >
        <div
          className="mx-auto max-w-2xl border-2 border-dashed px-6 py-10 text-center sm:px-10"
          style={{ borderColor: hexToRgba(brand, 0.5) }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--landing-brand)" }}
          >
            {getCopy(content, "ctaEyebrow", "Official Trial Class")}
          </p>
          <h2
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            {getCopy(content, "ctaTitle", "우리 체육관, 먼저 체험해 보세요")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: hexToRgba(INK, 0.7) }}>
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
