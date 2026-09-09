import { HeroSection } from "@/components/HeroSection";
import { TrialRequestForm } from "@/components/TrialRequestForm";
import {
  DEFAULT_BRAND_COLOR,
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

  return (
    <article
      className="min-h-full bg-white text-zinc-900"
      style={landingCssVars(brand, brandFg)}
    >
      <HeroSection content={content} preview={preview} />

      <section className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Program
        </h2>
        <div className="mt-2">
          <ProgramRow
            label="유치부"
            title="처음 만나는 태권도"
            description="처음 태권도를 접하는 아이들을 위한 기초 수련."
          />
          <ProgramRow
            label="초등·중고등"
            title="기본기부터 겨루기까지"
            description="기본기, 품새, 겨루기를 단계별로 익히는 수업."
          />
          <ProgramRow
            label="성인반"
            title="체력과 자기 관리"
            description="퇴근 후에도 참여할 수 있는 성인 수업 안내가 들어갑니다."
          />
          <div className="border-t border-zinc-200" />
        </div>
      </section>

      <section
        id={preview ? undefined : "trial"}
        className="border-t border-zinc-200 px-5 py-14 sm:px-8"
      >
        <div className="mx-auto max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--landing-brand)" }}
          >
            Trial Class
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            우리 체육관, 먼저 체험해 보세요
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
            방문 전 체험 수업을 신청하면 관장님이 일정과 안내를 도와드립니다.
          </p>
          <div className="mt-7">
            <TrialRequestForm dojangId={content.id} disabled={preview} />
          </div>
        </div>
      </section>
    </article>
  );
}
