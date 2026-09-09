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

const IVORY = "#F5F0E4";
const INK = "#1C1C1C";

function ProgramEntry({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-t py-6" style={{ borderColor: "rgba(28,28,28,0.12)" }}>
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: "var(--landing-brand)" }}
      />
      <div>
        <h3 className="text-lg font-semibold" style={{ color: INK }}>
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6" style={{ color: "rgba(28,28,28,0.7)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function TraditionalTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <article
      className="min-h-full"
      style={{ ...landingCssVars(brand, brandFg), backgroundColor: IVORY, color: INK }}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <h2
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--landing-brand)", fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          修練 Program
        </h2>
        <div className="mt-2">
          <ProgramEntry
            title="유치부"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
          />
          <ProgramEntry
            title="초등 · 중고등"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
          />
          <ProgramEntry
            title="성인반"
            description="체력과 자기 관리를 위한 성인 수련 자리입니다."
          />
          <div className="border-t" style={{ borderColor: "rgba(28,28,28,0.12)" }} />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="border-t px-5 py-14 sm:px-8"
        style={{ borderColor: "rgba(28,28,28,0.12)" }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: "var(--landing-brand)" }}
          >
            體驗 Trial Class
          </p>
          <h2
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
          >
            우리 체육관, 먼저 체험해 보세요
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: "rgba(28,28,28,0.7)" }}>
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
