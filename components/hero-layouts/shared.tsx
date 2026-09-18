"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import {
  DEFAULT_HERO_IMAGE_POSITION,
  HEADING_FONT_VARS,
  createCanvasElement,
  type CanvasTextElement,
  type DojangLandingContent,
  type HeadingFont,
  type HeroImagePosition,
} from "@/types/dojang";
import { getCopy } from "@/lib/dojang/copy";
import { heroContentPaddingClass } from "@/lib/dojang/brand";
import { useCanvasEditor } from "@/lib/dojang/canvas-context";
import {
  DEFAULT_CANVAS_POSITIONS,
  type HeroLayoutId,
} from "@/lib/dojang/hero-default-positions";
import { EditableCanvasLayer } from "./EditableCanvasLayer";

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

// Only used the moment a hero first switches into canvas mode (i.e.
// canvasElements is present but still empty) - seeds the title,
// description and trial button as real, draggable canvas elements at
// positions matching where this layout's fixed CSS would have placed
// them, instead of everything piling up at createCanvasElement()'s
// hardcoded { xPct: 8, yPct: 40 } default.
function defaultCanvasElementsForHero(
  content: DojangLandingContent,
  layoutId: HeroLayoutId,
  textColor: string,
  trialLabel: string,
): CanvasTextElement[] {
  const positions = DEFAULT_CANVAS_POSITIONS[layoutId];
  return [
    createCanvasElement({
      id: "hero-title",
      text: content.name || "도장 이름",
      fontSize: 40,
      fontWeight: "bold",
      color: textColor,
      align: "left",
      desktop: positions.title.desktop,
      mobile: positions.title.mobile,
    }),
    createCanvasElement({
      id: "hero-description",
      text:
        content.description ||
        "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다.",
      fontSize: 16,
      color: textColor,
      align: "left",
      desktop: positions.description.desktop,
      mobile: positions.description.mobile,
    }),
    createCanvasElement({
      id: "hero-trial-button",
      text: trialLabel,
      fontSize: 16,
      fontWeight: "bold",
      color: textColor,
      align: "left",
      desktop: positions.trialButtonText.desktop,
      mobile: positions.trialButtonText.mobile,
    }),
  ];
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
  canvasElements,
  layoutId,
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
  canvasElements?: CanvasTextElement[];
  layoutId: HeroLayoutId;
}) {
  const { editable, breakpoint, onBreakpointChange, onChange } = useCanvasEditor();
  const trialLabel = getCopy(content, "trialButtonText", "체험 신청하기");

  if (canvasElements) {
    const elements =
      canvasElements.length > 0
        ? canvasElements
        : defaultCanvasElementsForHero(content, layoutId, textColor, trialLabel);

    return (
      <EditableCanvasLayer
        elements={elements}
        onChange={onChange}
        editable={editable}
        breakpoint={breakpoint}
        onBreakpointChange={onBreakpointChange}
        defaultTextColor={textColor}
      />
    );
  }

  return (
    <>
      <div className="relative z-10 px-5 pt-5 sm:px-8">
        <p className="text-sm font-semibold tracking-wide" style={{ color: mutedColor }}>
          {content.name || "도장 이름"}
        </p>
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

export function HeroPhoto({
  src,
  className = "",
  position,
}: {
  src: string;
  className?: string;
  position?: HeroImagePosition;
}) {
  const { editable, onImagePositionChange } = useCanvasEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const resolved = position ?? DEFAULT_HERO_IMAGE_POSITION;

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!editable) return;
    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = resolved;

    function onMove(moveEvent: PointerEvent) {
      const dxPct = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dyPct = ((moveEvent.clientY - startY) / rect.height) * 100;
      onImagePositionChange({
        ...startPos,
        xPct: Math.min(Math.max(startPos.xPct - dxPct, 0), 100),
        yPct: Math.min(Math.max(startPos.yPct - dyPct, 0), 100),
      });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function adjustZoom(delta: number) {
    onImagePositionChange({
      ...resolved,
      zoom: Math.min(Math.max(resolved.zoom + delta, 1), 2.5),
    });
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${editable ? "cursor-move touch-none" : ""}`}
      onPointerDown={handlePointerDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className={`h-full w-full object-cover ${className}`}
        style={{
          objectPosition: `${resolved.xPct}% ${resolved.yPct}%`,
          transform: `scale(${resolved.zoom})`,
          transformOrigin: `${resolved.xPct}% ${resolved.yPct}%`,
        }}
      />
      {editable ? (
        <div
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-zinc-900 shadow-lg"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => adjustZoom(-0.1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold hover:bg-zinc-100"
          >
            -
          </button>
          <span className="px-1 text-xs font-semibold text-zinc-600">사진 확대</span>
          <button
            type="button"
            onClick={() => adjustZoom(0.1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold hover:bg-zinc-100"
          >
            +
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function heroLocation(content: DojangLandingContent): string {
  return [content.region, content.address].filter(Boolean).join(" ");
}
