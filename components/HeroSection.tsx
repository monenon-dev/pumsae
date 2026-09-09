import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_HERO_LAYOUT,
  normalizeHeroLayout,
  type DojangLandingContent,
  type HeroLayout,
} from "@/types/dojang";
import {
  getReadableTextColor,
  hexToRgba,
  normalizeHexColor,
} from "@/lib/dojang/brand";

type HeroSectionProps = {
  content: DojangLandingContent;
  preview?: boolean;
};

function TrialButton({
  href,
  large = false,
  backgroundColor,
  color,
}: {
  href?: string;
  large?: boolean;
  backgroundColor: string;
  color: string;
}) {
  const className = large
    ? "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold shadow-sm"
    : "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm";
  const style = { backgroundColor, color };

  if (!href) {
    return (
      <span className={className} style={style}>
        체험 신청하기
      </span>
    );
  }

  return (
    <a href={href} className={className} style={style}>
      체험 신청하기
    </a>
  );
}

function HeroCopy({
  content,
  location,
  trialHref,
  tone,
  brand,
  brandFg,
}: {
  content: DojangLandingContent;
  location: string;
  trialHref?: string;
  tone: "on-dark" | "on-brand";
  brand: string;
  brandFg: string;
}) {
  const onDark = tone === "on-dark";
  const buttonBg = onDark ? brand : brandFg;
  const buttonFg = onDark ? brandFg : brand;

  return (
    <>
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8">
        <p
          className={`text-sm font-semibold tracking-wide ${
            onDark ? "text-white/90" : "opacity-90"
          }`}
        >
          {content.name || "도장 이름"}
        </p>
        <TrialButton
          href={trialHref}
          backgroundColor={buttonBg}
          color={buttonFg}
        />
      </div>

      <div className="relative z-10 px-5 pb-10 pt-20 sm:px-8 sm:pb-12">
        {content.logoUrl ? (
          // User-provided URLs can be any host, so native img is used on purpose.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.logoUrl}
            alt={`${content.name} 로고`}
            className="mb-5 h-16 w-16 rounded-full border-2 bg-white object-cover shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]"
            style={{ borderColor: brand }}
          />
        ) : null}
        {location ? (
          <p
            className={`mb-2 text-xs font-medium tracking-wide ${
              onDark ? "text-white/80" : "opacity-80"
            }`}
          >
            {location}
          </p>
        ) : null}
        <h1
          className={`text-balance text-3xl font-semibold tracking-tight sm:text-5xl ${
            onDark ? "text-white" : ""
          }`}
        >
          {content.name || "도장 이름"}
        </h1>
        <p
          className={`mt-4 max-w-xl text-sm leading-7 sm:text-base ${
            onDark ? "text-white/90" : "opacity-90"
          }`}
        >
          {content.description ||
            "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다."}
        </p>
        {content.phone ? (
          <p className={`mt-3 text-sm ${onDark ? "text-white/80" : "opacity-80"}`}>
            문의 {content.phone}
          </p>
        ) : null}
        <div className="mt-7">
          <TrialButton
            href={trialHref}
            large
            backgroundColor={buttonBg}
            color={buttonFg}
          />
        </div>
      </div>
    </>
  );
}

function GradientLayer({ brand }: { brand: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(160deg, ${brand} 0%, #111827 72%)`,
      }}
    />
  );
}

function HeroPhoto({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function HeroSection({ content, preview = false }: HeroSectionProps) {
  const layout: HeroLayout = normalizeHeroLayout(
    content.heroLayout ?? DEFAULT_HERO_LAYOUT,
  );
  const brand = normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR);
  const brandFg = getReadableTextColor(brand);
  const trialHref = preview ? undefined : "#trial";
  const location = [content.region, content.address].filter(Boolean).join(" ");
  const copy = {
    content,
    location,
    trialHref,
    brand,
    brandFg,
  };

  if (layout === "SOLID") {
    return (
      <header
        className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden"
        style={{ backgroundColor: brand, color: brandFg }}
      >
        <HeroCopy {...copy} tone="on-brand" />
      </header>
    );
  }

  if (layout === "SPLIT") {
    return (
      <header className="grid min-h-[78svh] overflow-hidden bg-zinc-900 md:grid-cols-2">
        <div
          className="flex min-h-[52svh] flex-col justify-end"
          style={{ backgroundColor: brand, color: brandFg }}
        >
          <HeroCopy {...copy} tone="on-brand" />
        </div>
        <div className="relative min-h-[42vh] bg-zinc-800 md:min-h-full">
          {content.heroImageUrl ? (
            <HeroPhoto src={content.heroImageUrl} />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${hexToRgba(brand, 0.45)} 0%, #27272a 100%)`,
              }}
            />
          )}
        </div>
      </header>
    );
  }

  if (layout === "PHOTO_COVER") {
    return (
      <header className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-zinc-900">
        {content.heroImageUrl ? (
          <HeroPhoto src={content.heroImageUrl} />
        ) : (
          <GradientLayer brand={brand} />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <HeroCopy {...copy} tone="on-dark" />
      </header>
    );
  }

  return (
    <header className="relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-zinc-900">
      <GradientLayer brand={brand} />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${hexToRgba("#000000", 0.78)} 0%, ${hexToRgba(brand, 0.32)} 48%, ${hexToRgba("#000000", 0.18)} 100%)`,
        }}
      />
      <HeroCopy {...copy} tone="on-dark" />
    </header>
  );
}
