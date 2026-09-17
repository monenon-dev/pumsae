"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  DEFAULT_CUSTOM_BG_COLOR,
  DEFAULT_CUSTOM_TEXT_COLOR,
  createCanvasElement,
  type CanvasElementPosition,
  type CanvasTextElement,
} from "@/types/dojang";
import { heroMinHeightClass, normalizeHexColor } from "@/lib/dojang/brand";
import { useCanvasEditor } from "@/lib/dojang/canvas-context";
import { beginInlineTextEdit } from "@/lib/dojang/inline-edit";
import type { HeroComponentProps } from "./shared";

function elementStyle(
  element: CanvasTextElement,
  position: CanvasElementPosition,
): CSSProperties {
  return {
    left: `${position.xPct}%`,
    top: `${position.yPct}%`,
    width: `${position.widthPct}%`,
    fontSize: `${element.fontSize}px`,
    fontWeight: element.fontWeight === "bold" ? 700 : 400,
    color: element.color,
    textAlign: element.align,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
}

function defaultElements(content: HeroComponentProps["content"]): CanvasTextElement[] {
  return [
    createCanvasElement({
      id: "preview-name",
      text: content.name || "도장 이름",
      fontSize: 40,
      fontWeight: "bold",
      desktop: { xPct: 8, yPct: 62, widthPct: 60 },
      mobile: { xPct: 8, yPct: 55, widthPct: 84 },
    }),
    createCanvasElement({
      id: "preview-desc",
      text: content.description || "소개글을 입력하면 이 자리에 체육관 이야기가 표시됩니다.",
      fontSize: 16,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const elements =
    content.canvasElements.length > 0 ? content.canvasElements : defaultElements(content);
  const selected = elements.find((el) => el.id === selectedId) ?? null;

  function updatePosition(id: string, patch: Partial<CanvasElementPosition>) {
    onChange((els) =>
      els.map((el) =>
        el.id === id ? { ...el, [breakpoint]: { ...el[breakpoint], ...patch } } : el,
      ),
    );
  }

  function updateElement(id: string, patch: Partial<CanvasTextElement>) {
    onChange((els) => els.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  }

  function handleDragStart(event: ReactPointerEvent<HTMLDivElement>, id: string) {
    if (!editable) return;
    event.stopPropagation();
    setSelectedId(id);
    const container = containerRef.current;
    const el = elements.find((item) => item.id === id);
    if (!container || !el) return;
    const rect = container.getBoundingClientRect();
    const startPos = el[breakpoint];
    const startX = event.clientX;
    const startY = event.clientY;

    function onMove(moveEvent: PointerEvent) {
      const dxPct = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dyPct = ((moveEvent.clientY - startY) / rect.height) * 100;
      const nextX = Math.min(Math.max(startPos.xPct + dxPct, 0), 100 - startPos.widthPct);
      const nextY = Math.min(Math.max(startPos.yPct + dyPct, 0), 95);
      updatePosition(id, { xPct: nextX, yPct: nextY });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleResizeStart(event: ReactPointerEvent<HTMLDivElement>, id: string) {
    if (!editable) return;
    event.stopPropagation();
    event.preventDefault();
    const container = containerRef.current;
    const el = elements.find((item) => item.id === id);
    if (!container || !el) return;
    const rect = container.getBoundingClientRect();
    const startPos = el[breakpoint];
    const startX = event.clientX;

    function onMove(moveEvent: PointerEvent) {
      const dxPct = ((moveEvent.clientX - startX) / rect.width) * 100;
      const nextWidth = Math.min(Math.max(startPos.widthPct + dxPct, 10), 100 - startPos.xPct);
      updatePosition(id, { widthPct: nextWidth });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleAdd() {
    const created = createCanvasElement({ color: defaultTextColor });
    onChange((els) => [...els, created]);
    setSelectedId(created.id);
  }

  function handleDelete() {
    if (!selectedId) return;
    onChange((els) => els.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  return (
    <header
      ref={containerRef}
      className={`relative overflow-hidden ${heroMinHeightClass(content.sectionSpacing, "min-h-[78svh]")}`}
      style={{ backgroundColor: bg }}
      onClick={() => editable && setSelectedId(null)}
    >
      {elements.map((el) => {
        if (!editable) {
          return (
            <div key={el.id}>
              <div
                className="absolute sm:hidden"
                style={elementStyle(el, el.mobile)}
              >
                {el.text}
              </div>
              <div
                className="absolute hidden sm:block"
                style={elementStyle(el, el.desktop)}
              >
                {el.text}
              </div>
            </div>
          );
        }

        const isSelected = selectedId === el.id;
        return (
          <div
            key={el.id}
            className={`absolute cursor-move select-none rounded ${
              isSelected ? "outline outline-2 outline-dashed outline-white/70" : ""
            }`}
            style={elementStyle(el, el[breakpoint])}
            onPointerDown={(event) => handleDragStart(event, el.id)}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedId(el.id);
            }}
            onDoubleClick={(event) => {
              event.stopPropagation();
              setSelectedId(el.id);
              beginInlineTextEdit(event.currentTarget, {
                multiline: true,
                onCommit: (text) => updateElement(el.id, { text: text || "텍스트" }),
              });
            }}
          >
            {el.text}
            {isSelected ? (
              <div
                onPointerDown={(event) => handleResizeStart(event, el.id)}
                className="absolute -right-1.5 top-1/2 h-4 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-white shadow"
              />
            ) : null}
          </div>
        );
      })}

      {editable ? (
        <div
          className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow"
          >
            + 텍스트 추가
          </button>
          <div className="flex overflow-hidden rounded-full bg-white/90 text-xs font-semibold shadow">
            <button
              type="button"
              onClick={() => onBreakpointChange("desktop")}
              className={`px-2.5 py-1.5 ${breakpoint === "desktop" ? "bg-zinc-900 text-white" : "text-zinc-700"}`}
            >
              PC
            </button>
            <button
              type="button"
              onClick={() => onBreakpointChange("mobile")}
              className={`px-2.5 py-1.5 ${breakpoint === "mobile" ? "bg-zinc-900 text-white" : "text-zinc-700"}`}
            >
              모바일
            </button>
          </div>
        </div>
      ) : null}

      {editable && selected ? (
        <div
          className="absolute right-3 top-3 z-20 flex flex-wrap items-center gap-1 rounded-full bg-white/90 px-2 py-1.5 shadow"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() =>
              updateElement(selected.id, {
                fontSize: Math.max(10, selected.fontSize - 2),
              })
            }
            className="h-6 w-6 rounded-full text-sm font-bold text-zinc-700 hover:bg-zinc-100"
          >
            -
          </button>
          <span className="w-6 text-center text-xs text-zinc-600">{selected.fontSize}</span>
          <button
            type="button"
            onClick={() =>
              updateElement(selected.id, {
                fontSize: Math.min(120, selected.fontSize + 2),
              })
            }
            className="h-6 w-6 rounded-full text-sm font-bold text-zinc-700 hover:bg-zinc-100"
          >
            +
          </button>
          <button
            type="button"
            onClick={() =>
              updateElement(selected.id, {
                fontWeight: selected.fontWeight === "bold" ? "normal" : "bold",
              })
            }
            className={`h-6 w-6 rounded-full text-sm font-bold hover:bg-zinc-100 ${
              selected.fontWeight === "bold" ? "bg-zinc-200" : "text-zinc-700"
            }`}
          >
            B
          </button>
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => updateElement(selected.id, { align })}
              className={`h-6 w-6 rounded-full text-xs text-zinc-700 hover:bg-zinc-100 ${
                selected.align === align ? "bg-zinc-200" : ""
              }`}
            >
              {align === "left" ? "L" : align === "center" ? "C" : "R"}
            </button>
          ))}
          <input
            type="color"
            value={selected.color}
            onChange={(event) => updateElement(selected.id, { color: event.target.value })}
            className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
          />
          <button
            type="button"
            onClick={handleDelete}
            className="ml-1 rounded-full px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      ) : null}
    </header>
  );
}
