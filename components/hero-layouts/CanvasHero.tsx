"use client";

import {
  DEFAULT_CUSTOM_BG_COLOR,
  DEFAULT_CUSTOM_TEXT_COLOR,
  createCanvasElement,
  type CanvasTextElement,
} from "@/types/dojang";
import { heroMinHeightClass, normalizeHexColor } from "@/lib/dojang/brand";
import { useCanvasEditor } from "@/lib/dojang/canvas-context";
import { EditableCanvasLayer } from "./EditableCanvasLayer";
import type { HeroComponentProps } from "./shared";

function defaultElements(
  content: HeroComponentProps["content"],
  textColor: string,
): CanvasTextElement[] {
  return [
    createCanvasElement({
      id: "preview-name",
      text: content.name || "도장 이름",
      fontSize: 40,
      fontWeight: "bold",
      color: textColor,
      desktop: { xPct: 8, yPct: 62, widthPct: 60 },
      mobile: { xPct: 8, yPct: 55, widthPct: 84 },
    }),
    createCanvasElement({
      id: "preview-desc",
      text: content.description || "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다.",
      fontSize: 16,
      color: textColor,
      desktop: { xPct: 8, yPct: 78, widthPct: 46 },
      mobile: { xPct: 8, yPct: 74, widthPct: 84 },
    }),
  ];
}

export function CanvasHero({ content }: HeroComponentProps) {
  const bg = normalizeHexColor(content.customBgColor, DEFAULT_CUSTOM_BG_COLOR);
  const defaultTextColor = normalizeHexColor(
    content.customTextColor,
    DEFAULT_CUSTOM_TEXT_COLOR,
  );
  const { editable, breakpoint, onBreakpointChange, onChange } = useCanvasEditor();

  const elements =
    content.canvasElements.length > 0
      ? content.canvasElements
      : defaultElements(content, defaultTextColor);

  return (
    <header
      className={`relative overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
      style={{ backgroundColor: bg }}
    >
      <EditableCanvasLayer
        elements={elements}
        onChange={onChange}
        editable={editable}
        breakpoint={breakpoint}
        onBreakpointChange={onBreakpointChange}
        defaultTextColor={defaultTextColor}
      />
    </header>
  );
}
