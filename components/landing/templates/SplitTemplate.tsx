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

function SplitRow({
  label,
  title,
  description,
  reverse = false,
}: {
  label: string;
  title: string;
  description: string;
  reverse?: boolean;
}) {
  return (
    <div className="grid border-t border-zinc-200 md:grid-cols-2">
      <div
        className={`flex items-center px-5 py-10 sm:px-8 ${reverse ? "md:order-2" : ""}`}
        style={{
          backgroundColor: "var(--landing-brand-soft)",
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--landing-brand)" }}
        >
          {label}
        </p>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 sm:px-8">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

export function SplitTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <article
      className="min-h-full bg-white text-zinc-900"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <SplitRow
        label="KIDS / TEENS"
        title="유치부 · 초중고"
        description="처음 태권도를 접하는 아이들부터, 기본기와 품새·겨루기를 단계별로 익히는 청소년까지."
      />
      <SplitRow
        label="ADULT"
        title="성인반"
        description="체력과 자기 관리를 위한 성인 수련 자리. 퇴근 후에도 참여할 수 있는 저녁반이 있습니다."
        reverse
      />

      <section
        id={preview ? undefined : "trial"}
        className="grid border-t border-zinc-200 md:grid-cols-2"
      >
        <div
          className="flex flex-col justify-center px-5 py-12 sm:px-8"
          style={{
            backgroundColor: "var(--landing-brand)",
            color: "var(--landing-brand-fg)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
            Trial Class
          </p>
          <h2
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            우리 체육관, 먼저 체험해 보세요
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 opacity-90">
            방문 전 체험 수업을 신청하면 관장님이 일정과 안내를 도와드립니다.
          </p>
        </div>
        <div className="px-5 py-12 sm:px-8">
          <TrialRequestForm dojangId={content.id} disabled={preview} />
        </div>
      </section>
    </article>
  );
}
