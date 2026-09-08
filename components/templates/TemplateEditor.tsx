"use client";

import { toPng } from "html-to-image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { savePromoTemplate } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";
import { sanitizePromoContent } from "@/lib/promo/content";
import { PromoCard } from "@/components/templates/PromoCard";
import { applyLayout, createPromoContent, layoutsForType } from "@/lib/promo/layouts";
import {
  BODY_FONT_SIZES,
  FONT_WEIGHT_LABELS,
  PROMO_CARD_SIZE,
  PROMO_FONT_WEIGHTS,
  PROMO_TEMPLATE_TYPES,
  PROMO_TYPE_LABELS,
  SUBTITLE_FONT_SIZES,
  TITLE_FONT_SIZES,
  type PromoFontWeight,
  type PromoTemplateContent,
  type PromoTemplateType,
} from "@/types/promo-template";

type TemplateEditorProps = {
  dojangName: string;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";

const selectClassName = inputClassName;

function fontSizeLabel(size: number): string {
  return `${size}px`;
}

export function TemplateEditor({ dojangName }: TemplateEditorProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<PromoTemplateContent>(() =>
    createPromoContent("AWARD", dojangName),
  );
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const layouts = useMemo(() => layoutsForType(content.type), [content.type]);

  function updateField<K extends keyof PromoTemplateContent>(
    key: K,
    value: PromoTemplateContent[K],
  ) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  function changeType(type: PromoTemplateType) {
    setContent(createPromoContent(type, content.dojangName));
    setMessage(null);
  }

  function changeLayout(layoutId: string) {
    setContent((current) => applyLayout(current, layoutId));
    setMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const sanitized = sanitizePromoContent(content);
      if (!sanitized) {
        setMessage({ type: "error", text: "제목과 템플릿 종류를 확인해 주세요." });
        return;
      }

      const result = await savePromoTemplate(sanitized);
      setMessage({
        type: "success",
        text: result.success ?? "카드뉴스를 저장했습니다.",
      });
    } catch (saveError) {
      setMessage({
        type: "error",
        text:
          saveError instanceof ApiError
            ? saveError.message
            : "저장에 실패했습니다.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickDownload() {
    const node = captureRef.current;
    if (!node) {
      return;
    }

    setDownloading(true);
    setMessage(null);

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 1,
        width: PROMO_CARD_SIZE,
        height: PROMO_CARD_SIZE,
        canvasWidth: PROMO_CARD_SIZE,
        canvasHeight: PROMO_CARD_SIZE,
        style: {
          transform: "none",
        },
      });

      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      link.download = `pumsae-${content.type.toLowerCase()}-${stamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setMessage({
        type: "error",
        text: "이미지를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:items-start">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              카드뉴스 만들기
            </h1>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              왼쪽에서 고치면 오른쪽 미리보기가 바로 바뀝니다.
            </p>
          </div>
          <Link
            href="/dashboard/templates"
            className="shrink-0 text-sm font-medium text-zinc-900 underline"
          >
            저장한 카드
          </Link>
        </div>

        <div className="mt-6 space-y-5">
          <fieldset>
            <legend className="text-sm font-medium">템플릿 종류</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PROMO_TEMPLATE_TYPES.map((type) => {
                const selected = content.type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => changeType(type)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      selected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {PROMO_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">레이아웃</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {layouts.map((layout) => {
                const selected = content.layoutId === layout.id;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => changeLayout(layout.id)}
                    className={`overflow-hidden rounded-lg border text-left ${
                      selected
                        ? "border-zinc-900 ring-2 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <span
                      className="block aspect-square"
                      style={{ backgroundColor: layout.backgroundColor }}
                    >
                      <span
                        className="block h-2 w-full"
                        style={{ backgroundColor: layout.accentColor }}
                      />
                    </span>
                    <span className="block truncate px-1.5 py-1 text-center text-[11px] font-medium text-zinc-600">
                      {layout.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block text-sm font-medium">
            제목
            <input
              value={content.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            부제목
            <input
              value={content.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            본문
            <textarea
              rows={4}
              value={content.body}
              onChange={(event) => updateField("body", event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            도장 이름
            <input
              value={content.dojangName}
              onChange={(event) => updateField("dojangName", event.target.value)}
              className={inputClassName}
            />
          </label>

          <fieldset>
            <legend className="text-sm font-medium">배경색</legend>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={content.backgroundColor}
                onChange={(event) =>
                  updateField("backgroundColor", event.target.value)
                }
                className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-white p-1"
              />
              <span className="text-sm text-zinc-500">
                {content.backgroundColor}
              </span>
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              제목 크기
              <select
                value={content.titleFontSize}
                onChange={(event) =>
                  updateField("titleFontSize", Number(event.target.value))
                }
                className={selectClassName}
              >
                {TITLE_FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {fontSizeLabel(size)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              제목 굵기
              <select
                value={content.titleFontWeight}
                onChange={(event) =>
                  updateField(
                    "titleFontWeight",
                    Number(event.target.value) as PromoFontWeight,
                  )
                }
                className={selectClassName}
              >
                {PROMO_FONT_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {FONT_WEIGHT_LABELS[weight]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              부제목 크기
              <select
                value={content.subtitleFontSize}
                onChange={(event) =>
                  updateField("subtitleFontSize", Number(event.target.value))
                }
                className={selectClassName}
              >
                {SUBTITLE_FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {fontSizeLabel(size)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              부제목 굵기
              <select
                value={content.subtitleFontWeight}
                onChange={(event) =>
                  updateField(
                    "subtitleFontWeight",
                    Number(event.target.value) as PromoFontWeight,
                  )
                }
                className={selectClassName}
              >
                {PROMO_FONT_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {FONT_WEIGHT_LABELS[weight]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              본문 크기
              <select
                value={content.bodyFontSize}
                onChange={(event) =>
                  updateField("bodyFontSize", Number(event.target.value))
                }
                className={selectClassName}
              >
                {BODY_FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {fontSizeLabel(size)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              본문 굵기
              <select
                value={content.bodyFontWeight}
                onChange={(event) =>
                  updateField(
                    "bodyFontWeight",
                    Number(event.target.value) as PromoFontWeight,
                  )
                }
                className={selectClassName}
              >
                {PROMO_FONT_WEIGHTS.map((weight) => (
                  <option key={weight} value={weight}>
                    {FONT_WEIGHT_LABELS[weight]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {message ? (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                message.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {message.text}{" "}
              {message.type === "success" ? (
                <Link href="/dashboard/templates" className="underline">
                  목록 보기
                </Link>
              ) : null}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleQuickDownload()}
              disabled={downloading}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
            >
              {downloading ? "만드는 중..." : "빠른 다운로드"}
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !content.title.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </section>

      <section className="xl:sticky xl:top-20">
        <p className="mb-3 text-sm font-medium text-zinc-600">
          실시간 미리보기 · 1080×1080
        </p>
        <PreviewStage>
          <PromoCard ref={captureRef} content={content} />
        </PreviewStage>
      </section>
    </div>
  );
}

function PreviewStage({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      setScale(el.clientWidth / PROMO_CARD_SIZE);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm"
      style={{ height: PROMO_CARD_SIZE * scale }}
    >
      <div
        style={{
          width: PROMO_CARD_SIZE,
          height: PROMO_CARD_SIZE,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
