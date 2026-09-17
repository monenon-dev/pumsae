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

const ESPRESSO_INK = "#160f0a";

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
    <div
      className="flex gap-5 border-t py-6 first:border-t-0"
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
    >
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
  const spacing = content.sectionSpacing;

  return (
    <article
      className="min-h-full text-white"
      style={{ ...landingCssVars(brand, brandFg), backgroundColor: ESPRESSO_INK }}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className={`px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}>
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
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${ESPRESSO_INK} 0%, transparent 60%)`,
            }}
          />
        </section>
      ) : null}

      <section className={`px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-14")}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
          {getCopy(content, "programEyebrow", "Program")}
        </p>
        <div className="mt-6">
          <NumberedItem
            index="01"
            title={getCopy(content, "class1Title", "유치부")}
            description={getCopy(
              content,
              "class1Desc",
              "처음 태권도를 접하는 아이들을 위한 기초 수련.",
            )}
          />
          <NumberedItem
            index="02"
            title={getCopy(content, "class2Title", "초등 · 중고등")}
            description={getCopy(
              content,
              "class2Desc",
              "기본기, 품새, 겨루기를 단계별로 익히는 수업.",
            )}
          />
          <NumberedItem
            index="03"
            title={getCopy(content, "class3Title", "성인반")}
            description={getCopy(
              content,
              "class3Desc",
              "퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다.",
            )}
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className={`px-5 sm:px-8 ${sectionPaddingClass(spacing, "py-16")}`}
        style={{ backgroundColor: "var(--landing-brand)" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80"
            style={{ color: "var(--landing-brand-fg)" }}
          >
            {getCopy(content, "ctaEyebrow", "Trial Class")}
          </p>
          <h2
            className="mt-2 text-3xl font-semibold tracking-tight"
            style={{
              color: "var(--landing-brand-fg)",
              fontFamily: HEADING_FONT_VARS[content.headingFont],
            }}
          >
            {getCopy(content, "ctaTitle", "우리 체육관, 먼저 체험해 보세요")}
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-sm leading-6 opacity-90"
            style={{ color: "var(--landing-brand-fg)" }}
          >
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
