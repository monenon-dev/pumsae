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

function ProgramBubble({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <span className="text-3xl">{emoji}</span>
      <h3 className="mt-3 text-lg font-extrabold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

export function KidsTemplate({ content, preview = false }: TemplateProps) {
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);

  return (
    <article
      className="min-h-full bg-[#FFFBEF] text-zinc-900"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroLayoutSwitch content={content} preview={preview} />

      <section className="px-5 py-14 sm:px-8">
        <h2
          className="text-center text-2xl font-extrabold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          우리 반을 소개해요
        </h2>
        <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-3">
          <ProgramBubble
            emoji="🧒"
            title="유치부"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
          />
          <ProgramBubble
            emoji="🥋"
            title="초등·중고등"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
          />
          <ProgramBubble
            emoji="💪"
            title="성인반"
            description="체력과 자기 관리를 위한 성인 수련 자리입니다."
          />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="px-5 py-14 sm:px-8"
      >
        <div
          className="mx-auto max-w-2xl rounded-[2.5rem] px-6 py-10 text-center shadow-sm sm:px-10"
          style={{
            backgroundColor: "var(--landing-brand)",
            color: "var(--landing-brand-fg)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
            Trial Class
          </p>
          <h2
            className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
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
