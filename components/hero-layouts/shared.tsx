import { HEADING_FONT_VARS, type DojangLandingContent, type HeadingFont } from "@/types/dojang";
import { getCopy } from "@/lib/dojang/copy";
import { heroContentPaddingClass } from "@/lib/dojang/brand";

export type HeroComponentProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

const EDITABLE_HINT_CLASS =
  "cursor-text rounded-md outline-dashed outline-1 outline-offset-4 outline-transparent transition hover:outline-current/30 focus:outline-current/60";

export function TrialButton({
  href,
  large = false,
  backgroundColor,
  color,
  className = "",
  label = "체험 신청하기",
  editable = false,
}: {
  href?: string;
  large?: boolean;
  backgroundColor: string;
  color: string;
  className?: string;
  label?: string;
  editable?: boolean;
}) {
  const base = large
    ? "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold shadow-sm"
    : "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm";
  const style = { backgroundColor, color };

  if (!href) {
    return (
      <span
        className={`${base} ${className}${editable ? ` ${EDITABLE_HINT_CLASS}` : ""}`}
        style={style}
        data-editable-field={editable ? "trialButtonText" : undefined}
      >
        {label}
      </span>
    );
  }

  return (
    <a href={href} className={`${base} ${className}`} style={style}>
      {label}
    </a>
  );
}

export function HeroCopy({
  content,
  location,
  trialHref,
  textColor,
  mutedColor,
  buttonBg,
  buttonFg,
  headingFont,
  headingClassName = "",
  editable = false,
}: {
  content: DojangLandingContent;
  location: string;
  trialHref?: string;
  textColor: string;
  mutedColor: string;
  buttonBg: string;
  buttonFg: string;
  headingFont: HeadingFont;
  headingClassName?: string;
  editable?: boolean;
}) {
  const trialLabel = getCopy(content, "trialButtonText", "체험 신청하기");

  return (
    <>
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8">
        <p className="text-sm font-semibold tracking-wide" style={{ color: mutedColor }}>
          {content.name || "도장 이름"}
        </p>
        <TrialButton
          href={trialHref}
          backgroundColor={buttonBg}
          color={buttonFg}
          label={trialLabel}
          editable={editable}
        />
      </div>

      <div className={`relative z-10 ${heroContentPaddingClass(content.sectionSpacing)}`}>
        {content.logoUrl ? (
          // User-provided URLs can be any host, so native img is used on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.logoUrl}
            alt={`${content.name} 로고`}
            className="mb-5 h-16 w-16 rounded-full border-2 bg-white object-cover shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]"
            style={{ borderColor: buttonBg }}
          />
        ) : null}
        {location ? (
          <p className="mb-2 text-xs font-medium tracking-wide" style={{ color: mutedColor }}>
            {location}
          </p>
        ) : null}
        <h1
          className={`text-balance text-3xl font-semibold tracking-tight sm:text-5xl ${headingClassName}${editable ? ` ${EDITABLE_HINT_CLASS}` : ""}`}
          style={{ color: textColor, fontFamily: HEADING_FONT_VARS[headingFont] }}
          data-editable-field={editable ? "name" : undefined}
        >
          {content.name || "도장 이름"}
        </h1>
        <p
          className={`mt-4 max-w-xl text-sm leading-7 sm:text-base${editable ? ` ${EDITABLE_HINT_CLASS}` : ""}`}
          style={{ color: textColor, opacity: 0.9 }}
          data-editable-field={editable ? "description" : undefined}
        >
          {content.description ||
            "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다."}
        </p>
        {content.phone ? (
          <p className="mt-3 text-sm" style={{ color: mutedColor }}>
            문의 {content.phone}
          </p>
        ) : null}
        <div className="mt-7">
          <TrialButton
            href={trialHref}
            large
            backgroundColor={buttonBg}
            color={buttonFg}
            label={trialLabel}
            editable={editable}
          />
        </div>
      </div>
    </>
  );
}

export function GradientLayer({ brand }: { brand: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(160deg, ${brand} 0%, #111827 72%)`,
      }}
    />
  );
}

export function HeroPhoto({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
  );
}

export function heroLocation(content: DojangLandingContent): string {
  return [content.region, content.address].filter(Boolean).join(" ");
}
