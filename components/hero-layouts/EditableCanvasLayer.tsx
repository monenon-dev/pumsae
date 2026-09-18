"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  createCanvasElement,
  DEFAULT_HEADING_FONT,
  HEADING_FONTS,
  HEADING_FONT_LABELS,
  HEADING_FONT_VARS,
  type CanvasBreakpoint,
  type CanvasElementPosition,
  type CanvasTextElement,
  type HeadingFont,
} from "@/types/dojang";
import { beginInlineTextEdit } from "@/lib/dojang/inline-edit";

const MIN_WIDTH_PCT = 10;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 160;

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
    fontFamily: HEADING_FONT_VARS[element.fontFamily ?? DEFAULT_HEADING_FONT],
    fontStyle: element.italic ? "italic" : "normal",
    textDecoration: element.underline ? "underline" : "none",
    color: element.color,
    textAlign: element.align,
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
}

function DuplicateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4" aria-hidden>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type EditableCanvasLayerProps = {
  elements: CanvasTextElement[];
  onChange: (updater: (elements: CanvasTextElement[]) => CanvasTextElement[]) => void;
  editable: boolean;
  breakpoint: CanvasBreakpoint;
  onBreakpointChange: (breakpoint: CanvasBreakpoint) => void;
  defaultTextColor: string;
};

export function EditableCanvasLayer({
  elements,
  onChange,
  editable,
  breakpoint,
  onBreakpointChange,
  defaultTextColor,
}: EditableCanvasLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = elements.find((el) => el.id === selectedId) ?? null;

  // `elements` already falls back to the placeholder defaults when
  // content.canvasElements is empty. Mutations must be based on that
  // resolved list (not the possibly-empty `els` callback arg) so the
  // very first edit actually materializes the placeholders into real,
  // persisted elements instead of silently no-op'ing on an empty array.
  function updatePosition(id: string, patch: Partial<CanvasElementPosition>) {
    const next = elements.map((el) =>
      el.id === id ? { ...el, [breakpoint]: { ...el[breakpoint], ...patch } } : el,
    );
    onChange(() => next);
  }

  function updateElement(id: string, patch: Partial<CanvasTextElement>) {
    const next = elements.map((el) => (el.id === id ? { ...el, ...patch } : el));
    onChange(() => next);
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

  function handleResizeStart(event: ReactPointerEvent<HTMLDivElement>, id: string, side: 1 | -1) {
    if (!editable) return;
    event.stopPropagation();
    event.preventDefault();
    const container = containerRef.current;
    const el = elements.find((item) => item.id === id);
    if (!container || !el) return;
    const rect = container.getBoundingClientRect();
    const startPos = el[breakpoint];
    const startFontSize = el.fontSize;
    const startX = event.clientX;

    function onMove(moveEvent: PointerEvent) {
      const dxPct = (((moveEvent.clientX - startX) * side) / rect.width) * 100;
      const nextWidth = Math.min(
        Math.max(startPos.widthPct + dxPct, MIN_WIDTH_PCT),
        100 - startPos.xPct,
      );
      const scale = nextWidth / startPos.widthPct;
      updatePosition(id, { widthPct: nextWidth });
      updateElement(id, {
        fontSize: Math.min(
          MAX_FONT_SIZE,
          Math.max(MIN_FONT_SIZE, Math.round(startFontSize * scale)),
        ),
      });
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
    onChange(() => [...elements, created]);
    setSelectedId(created.id);
  }

  function handleDuplicate() {
    if (!selected) return;
    const copy = createCanvasElement({
      text: selected.text,
      fontSize: selected.fontSize,
      fontWeight: selected.fontWeight,
      fontFamily: selected.fontFamily,
      italic: selected.italic,
      underline: selected.underline,
      color: selected.color,
      align: selected.align,
      desktop: { ...selected.desktop, yPct: Math.min(95, selected.desktop.yPct + 6) },
      mobile: { ...selected.mobile, yPct: Math.min(95, selected.mobile.yPct + 6) },
    });
    onChange(() => [...elements, copy]);
    setSelectedId(copy.id);
  }

  function handleDelete() {
    if (!selectedId) return;
    onChange(() => elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onClick={() => editable && setSelectedId(null)}
    >
      {elements.map((el) => {
        if (!editable) {
          return (
            <div key={el.id}>
              <div className="absolute sm:hidden" style={elementStyle(el, el.mobile)}>
                {el.text}
              </div>
              <div className="absolute hidden sm:block" style={elementStyle(el, el.desktop)}>
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
              isSelected ? "outline outline-2 outline-sky-400" : "hover:outline hover:outline-1 hover:outline-sky-300/60"
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
              <>
                {([
                  ["-left-1.5 -top-1.5 cursor-nwse-resize", -1],
                  ["-right-1.5 -top-1.5 cursor-nesw-resize", 1],
                  ["-left-1.5 -bottom-1.5 cursor-nesw-resize", -1],
                  ["-right-1.5 -bottom-1.5 cursor-nwse-resize", 1],
                ] as const).map(([pos, side]) => (
                  <div
                    key={pos}
                    onPointerDown={(event) => handleResizeStart(event, el.id, side)}
                    className={`absolute h-3 w-3 rounded-full border-2 border-sky-400 bg-white shadow ${pos}`}
                  />
                ))}

                <div
                  className="absolute bottom-full left-1/2 z-30 mb-2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-zinc-900 px-2 py-1.5 text-white shadow-lg"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    title="복제"
                    className="rounded-full p-1.5 hover:bg-white/20"
                  >
                    <DuplicateIcon />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    title="삭제"
                    className="rounded-full p-1.5 hover:bg-white/20"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        );
      })}

      {editable ? (
        <div
          className="fixed left-4 top-4 z-20 flex flex-wrap items-center gap-1.5"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow"
          >
            + 텍스트 추가
          </button>
          <div className="flex overflow-hidden rounded-full bg-white text-xs font-semibold shadow">
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
          className="fixed bottom-4 right-4 z-30 w-64 space-y-3 rounded-2xl bg-white p-3 text-zinc-900 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">텍스트 스타일</span>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              닫기
            </button>
          </div>

          <select
            value={selected.fontFamily ?? DEFAULT_HEADING_FONT}
            onChange={(event) =>
              updateElement(selected.id, {
                fontFamily: event.target.value as HeadingFont,
              })
            }
            className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          >
            {HEADING_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: HEADING_FONT_VARS[font] }}>
                {HEADING_FONT_LABELS[font]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateElement(selected.id, {
                  fontSize: Math.max(MIN_FONT_SIZE, selected.fontSize - 2),
                })
              }
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-sm font-bold hover:bg-zinc-50"
            >
              -
            </button>
            <input
              type="number"
              value={selected.fontSize}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                if (!Number.isNaN(value)) {
                  updateElement(selected.id, {
                    fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value)),
                  });
                }
              }}
              className="w-14 rounded-lg border border-zinc-200 px-2 py-1 text-center text-sm"
            />
            <button
              type="button"
              onClick={() =>
                updateElement(selected.id, {
                  fontSize: Math.min(MAX_FONT_SIZE, selected.fontSize + 2),
                })
              }
              className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-sm font-bold hover:bg-zinc-50"
            >
              +
            </button>
            <input
              type="color"
              value={selected.color}
              onChange={(event) => updateElement(selected.id, { color: event.target.value })}
              className="ml-auto h-7 w-7 cursor-pointer rounded-full border border-zinc-200 bg-transparent p-0"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                updateElement(selected.id, {
                  fontWeight: selected.fontWeight === "bold" ? "normal" : "bold",
                })
              }
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold hover:bg-zinc-100 ${
                selected.fontWeight === "bold" ? "bg-zinc-900 text-white" : "text-zinc-700"
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => updateElement(selected.id, { italic: !selected.italic })}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm italic hover:bg-zinc-100 ${
                selected.italic ? "bg-zinc-900 text-white" : "text-zinc-700"
              }`}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => updateElement(selected.id, { underline: !selected.underline })}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm underline hover:bg-zinc-100 ${
                selected.underline ? "bg-zinc-900 text-white" : "text-zinc-700"
              }`}
            >
              U
            </button>
            <div className="mx-1 h-5 w-px bg-zinc-200" />
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => updateElement(selected.id, { align })}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs hover:bg-zinc-100 ${
                  selected.align === align ? "bg-zinc-900 text-white" : "text-zinc-700"
                }`}
              >
                {align === "left" ? "L" : align === "center" ? "C" : "R"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
