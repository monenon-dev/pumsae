"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { ImageField } from "@/components/upload/ImageField";
import { updateMyDojang } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";
import { hexToRgba, normalizeHexColor } from "@/lib/dojang/brand";
import { CanvasEditorContext } from "@/lib/dojang/canvas-context";
import { beginInlineTextEdit } from "@/lib/dojang/inline-edit";
import { isHttpUrl } from "@/lib/dojang/url";
import {
  CUSTOM_BG_COLOR_PRESETS,
  CUSTOM_TEXT_COLOR_PRESETS,
  DEFAULT_BRAND_COLOR,
  DEFAULT_CUSTOM_BG_COLOR,
  DEFAULT_CUSTOM_TEXT_COLOR,
  HEADING_FONTS,
  HEADING_FONT_LABELS,
  HEADING_FONT_VARS,
  HERO_LAYOUTS,
  HERO_LAYOUT_LABELS,
  SECTION_SPACINGS,
  SECTION_SPACING_LABELS,
  SECTION_TEXT_FIELDS,
  SECTION_TEXT_LAYOUT_FIELDS,
  type CanvasBreakpoint,
  type CanvasTextElement,
  type DojangLandingContent,
  type HeroLayout,
  withNormalizedHeroLayout,
} from "@/types/dojang";

type LandingEditorProps = {
  initial: DojangLandingContent;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500";

function HeroLayoutThumb({
  layout,
  brand,
  customBg,
  customText,
}: {
  layout: HeroLayout;
  brand: string;
  customBg: string;
  customText: string;
}) {
  if (layout === "GRADIENT") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 48%, #0b0f1a 100%)",
        }}
      >
        <span
          className="absolute -right-3 -top-3 h-8 w-8 rounded-full blur-md"
          style={{ backgroundColor: hexToRgba(brand, 0.6) }}
        />
      </span>
    );
  }

  if (layout === "SOLID") {
    return (
      <span
        className="block aspect-square border-b-4"
        style={{ backgroundColor: "#FAFAF9", borderColor: brand }}
      />
    );
  }

  if (layout === "PHOTO_COVER") {
    return (
      <span className="relative block aspect-square overflow-hidden bg-zinc-500">
        <span
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, #160f0a 0%, rgba(43,26,16,0.35) 55%, rgba(43,26,16,0.15) 100%)",
          }}
        />
        <span
          className="absolute left-1.5 top-1.5 h-px w-6"
          style={{ backgroundColor: brand }}
        />
      </span>
    );
  }

  if (layout === "TRADITIONAL") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{ backgroundColor: "#F5F0E4" }}
      >
        <span
          className="absolute -right-3 -top-3 h-10 w-10 rounded-full"
          style={{ border: "1px solid rgba(28,28,28,0.25)" }}
        />
        <span
          className="absolute bottom-0 right-1 text-2xl font-black leading-none"
          style={{ color: "rgba(28,28,28,0.15)" }}
        >
          道
        </span>
        <span
          className="absolute bottom-1.5 left-1.5 h-1 w-4 rounded-full"
          style={{ backgroundColor: brand }}
        />
      </span>
    );
  }

  if (layout === "DYNAMIC") {
    return (
      <span className="relative block aspect-square overflow-hidden bg-black">
        <span
          className="absolute -right-2 -top-3 h-7 w-7 rotate-[18deg]"
          style={{ backgroundColor: brand }}
        />
        <span
          className="absolute -right-4 top-3 h-6 w-6 rotate-[-12deg] opacity-50"
          style={{ backgroundColor: brand }}
        />
      </span>
    );
  }

  if (layout === "KIDS") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FDE68A 0%, #86EFAC 50%, #93C5FD 100%)",
        }}
      >
        <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/50" />
        <span className="absolute bottom-1 left-1 h-4 w-4 rounded-full bg-white/40" />
      </span>
    );
  }

  if (layout === "PREMIUM") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{ backgroundColor: "#0B0B0C" }}
      >
        <span className="absolute left-1.5 top-2 h-px w-6" style={{ backgroundColor: "#C9A15A" }} />
        <span
          className="absolute bottom-2 right-1.5 h-px w-8"
          style={{ backgroundColor: "rgba(201,161,90,0.5)" }}
        />
      </span>
    );
  }

  if (layout === "OCEAN") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f766e 0%, #0e7490 45%, #082f49 100%)",
        }}
      >
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white/90" />
      </span>
    );
  }

  if (layout === "MONO") {
    return (
      <span className="relative block aspect-square overflow-hidden border-2 border-zinc-900 bg-white">
        <span
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#18181b 1px, transparent 1px)",
            backgroundSize: "5px 5px",
          }}
        />
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brand }} />
      </span>
    );
  }

  if (layout === "SPOTLIGHT") {
    return (
      <span className="relative block aspect-square overflow-hidden" style={{ backgroundColor: "#050507" }}>
        <span
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{ backgroundColor: hexToRgba(brand, 0.6) }}
        />
      </span>
    );
  }

  if (layout === "BADGE") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{ backgroundColor: "#EDEAE1" }}
      >
        <span
          className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full border-2"
          style={{ borderColor: hexToRgba(brand, 0.6) }}
        />
      </span>
    );
  }

  if (layout === "CUSTOM") {
    return (
      <span
        className="relative flex aspect-square items-end justify-end overflow-hidden p-1.5"
        style={{ backgroundColor: customBg }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: customText }} />
        <span className="ml-1 h-2 w-2 rounded-full" style={{ backgroundColor: brand }} />
      </span>
    );
  }

  if (layout === "CANVAS") {
    return (
      <span
        className="relative block aspect-square overflow-hidden"
        style={{ backgroundColor: customBg }}
      >
        <span
          className="absolute left-1.5 top-1.5 h-1 w-5 rounded-sm"
          style={{ backgroundColor: customText }}
        />
        <span
          className="absolute bottom-1.5 left-1.5 h-1 w-3 rounded-sm"
          style={{ backgroundColor: brand }}
        />
        <span
          className="absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-sm border border-dashed"
          style={{ borderColor: hexToRgba(customText, 0.6) }}
        />
      </span>
    );
  }

  return (
    <span
      className="relative block aspect-square overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 48%, #0b0f1a 100%)",
      }}
    >
      <span
        className="absolute -right-3 -top-3 h-8 w-8 rounded-full blur-md"
        style={{ backgroundColor: hexToRgba(brand, 0.6) }}
      />
    </span>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M6 3h9l3 3v15H6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImagePickerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-4 4-3-3-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 5h14M12 5v14M9 19h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-zinc-500">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
      aria-hidden
    >
      <path
        d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h1.5A4.5 4.5 0 0 0 21 12c0-5-4-9-9-9z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AccordionRow({
  title,
  summary,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  summary: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium">{title}</span>
        <span className="flex items-center gap-2 text-sm text-zinc-600">
          {summary}
          <ChevronIcon open={expanded} />
        </span>
      </button>
      {expanded ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

export function LandingEditor({ initial }: LandingEditorProps) {
  const { user } = useAuth();
  const canEdit = user != null;
  const [content, setContent] = useState(() => withNormalizedHeroLayout(initial));
  const [saved, setSaved] = useState(() => withNormalizedHeroLayout(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<
    "design" | "font" | "brand" | "spacing" | null
  >(null);
  const [expandedTextSection, setExpandedTextSection] = useState<
    "classes" | "cta" | "layout" | null
  >(null);
  const [canvasBreakpoint, setCanvasBreakpoint] = useState<CanvasBreakpoint>("desktop");

  function toggleSection(
    section: "design" | "font" | "brand" | "spacing",
  ) {
    setExpandedSection((current) => (current === section ? null : section));
  }

  function toggleTextSection(section: "classes" | "cta" | "layout") {
    setExpandedTextSection((current) => (current === section ? null : section));
  }

  useEffect(() => {
    const next = withNormalizedHeroLayout(initial);
    setContent(next);
    setSaved(next);
  }, [initial]);

  const dirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(saved),
    [content, saved],
  );

  function updateField<K extends keyof DojangLandingContent>(
    key: K,
    value: DojangLandingContent[K],
  ) {
    setContent((current) => ({ ...current, [key]: value }));
    setSuccess(null);
  }

  function updateSectionText(key: string, value: string) {
    setContent((current) => ({
      ...current,
      sectionText: { ...current.sectionText, [key]: value },
    }));
    setSuccess(null);
  }

  function updateCanvasElements(
    updater: (elements: CanvasTextElement[]) => CanvasTextElement[],
  ) {
    setContent((current) => ({
      ...current,
      canvasElements: updater(current.canvasElements),
    }));
    setSuccess(null);
  }

  function beginInlineEdit(target: HTMLElement, field: string) {
    beginInlineTextEdit(target, {
      multiline: field === "description",
      onCommit: (text) => {
        if (field === "name") {
          updateField("name", text);
        } else if (field === "description") {
          updateField("description", text || null);
        } else {
          updateSectionText(field, text);
        }
      },
    });
  }

  function validateImages(): string | null {
    if (content.heroImageUrl && !isHttpUrl(content.heroImageUrl)) {
      return "대표 사진은 http(s) 이미지 주소여야 합니다.";
    }
    if (content.logoUrl && !isHttpUrl(content.logoUrl)) {
      return "로고는 http(s) 이미지 주소여야 합니다.";
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      return;
    }

    setError(null);
    setSuccess(null);

    const imageError = validateImages();
    if (imageError) {
      setError(imageError);
      return;
    }

    if (!content.name.trim()) {
      setError("도장 이름을 입력해 주세요.");
      return;
    }

    setSaving(true);

    try {
      const next = await updateMyDojang({
        name: content.name.trim(),
        description: content.description?.trim() || null,
        logoUrl: content.logoUrl,
        heroImageUrl: content.heroImageUrl,
        brandColor: normalizeHexColor(
          content.brandColor,
          DEFAULT_BRAND_COLOR,
        ),
        customBgColor:
          content.heroLayout === "CUSTOM" || content.heroLayout === "CANVAS"
            ? normalizeHexColor(content.customBgColor, DEFAULT_CUSTOM_BG_COLOR)
            : content.customBgColor,
        customTextColor:
          content.heroLayout === "CUSTOM" || content.heroLayout === "CANVAS"
            ? normalizeHexColor(content.customTextColor, DEFAULT_CUSTOM_TEXT_COLOR)
            : content.customTextColor,
        sectionSpacing: content.sectionSpacing,
        sectionText: content.sectionText,
        canvasElements: content.canvasElements,
        heroLayout: content.heroLayout,
        headingFont: content.headingFont,
      });
      setContent(next);
      setSaved(next);
      setSuccess("랜딩페이지를 저장했습니다. 공개 주소에서 바로 확인할 수 있습니다.");
    } catch (saveError) {
      const message =
        saveError instanceof ApiError
          ? saveError.message
          : "저장에 실패했습니다.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:items-start">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              랜딩페이지 편집
            </h1>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              이름, 소개, 사진만 넣으면 공개 홍보 페이지가 바로 바뀝니다.
            </p>
          </div>
          <Link
            href={`/${content.slug}`}
            target="_blank"
            className="shrink-0 text-sm font-medium text-zinc-900 underline"
          >
            공개 페이지 보기
          </Link>
        </div>

        {!canEdit ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            로그인 정보를 확인하는 중입니다...
          </p>
        ) : null}

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mt-6 flex flex-col max-xl:max-h-[70vh] max-xl:overflow-y-auto xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto"
        >
          <div className="space-y-5">
          <SectionCard icon={<DocumentIcon />} title="기본 정보">
            <label className="block text-sm font-medium">
              도장 이름
              <input
                name="name"
                required
                disabled={!canEdit}
                value={content.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block text-sm font-medium">
              소개글
              <textarea
                name="description"
                rows={4}
                disabled={!canEdit}
                value={content.description ?? ""}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={inputClassName}
                placeholder="우리 체육관을 한두 문장으로 소개해 주세요."
              />
            </label>
          </SectionCard>

          <SectionCard icon={<ImagePickerIcon />} title="이미지">
            <div className="grid grid-cols-2 gap-3">
              <ImageField
                label="대표 사진"
                hint="파일을 올리거나 https 이미지 주소를 붙여넣으세요."
                value={content.heroImageUrl}
                disabled={!canEdit}
                compact
                onChange={(next) => updateField("heroImageUrl", next)}
              />

              <ImageField
                label="로고"
                hint="정사각형 이미지가 가장 잘 맞습니다."
                value={content.logoUrl}
                disabled={!canEdit}
                compact
                onChange={(next) => updateField("logoUrl", next)}
              />
            </div>
          </SectionCard>

          <SectionCard icon={<PaletteIcon />} title="디자인">
            <div className="divide-y divide-zinc-200">
              <AccordionRow
                title="홈페이지 디자인"
                summary={<span>{HERO_LAYOUT_LABELS[content.heroLayout]}</span>}
                expanded={expandedSection === "design"}
                onToggle={() => toggleSection("design")}
              >
                <p className="mb-2 text-xs text-zinc-500">
                  히어로부터 아래 섹션 구성까지 페이지 전체가 함께 바뀌어요.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {HERO_LAYOUTS.map((layout) => {
                    const selected = content.heroLayout === layout;
                    return (
                      <button
                        key={layout}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => updateField("heroLayout", layout)}
                        className={`overflow-hidden rounded-lg border text-left disabled:opacity-50 ${
                          selected
                            ? "border-zinc-900 ring-2 ring-zinc-900"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                        aria-pressed={selected}
                      >
                        <HeroLayoutThumb
                          layout={layout}
                          brand={normalizeHexColor(
                            content.brandColor,
                            DEFAULT_BRAND_COLOR,
                          )}
                          customBg={normalizeHexColor(
                            content.customBgColor,
                            DEFAULT_CUSTOM_BG_COLOR,
                          )}
                          customText={normalizeHexColor(
                            content.customTextColor,
                            DEFAULT_CUSTOM_TEXT_COLOR,
                          )}
                        />
                        <span className="block truncate px-1.5 py-1 text-center text-[11px] font-medium text-zinc-600">
                          {HERO_LAYOUT_LABELS[layout]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {content.heroLayout === "CUSTOM" || content.heroLayout === "CANVAS" ? (
                  <div className="mt-4 space-y-4 border-t border-zinc-200 pt-4">
                    <fieldset>
                      <legend className="text-sm font-medium">배경색</legend>
                      <p className="mt-1 text-xs text-zinc-500">
                        {content.heroLayout === "CANVAS"
                          ? "캔버스의 전체 배경색이에요."
                          : "완전 커스텀 디자인의 전체 배경색이에요."}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="color"
                          disabled={!canEdit}
                          value={normalizeHexColor(
                            content.customBgColor,
                            DEFAULT_CUSTOM_BG_COLOR,
                          )}
                          onChange={(event) =>
                            updateField("customBgColor", event.target.value)
                          }
                          className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-white p-1 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          disabled={!canEdit}
                          value={content.customBgColor || DEFAULT_CUSTOM_BG_COLOR}
                          onChange={(event) =>
                            updateField("customBgColor", event.target.value)
                          }
                          className="w-28 rounded-lg border border-zinc-300 px-2 py-2 text-sm uppercase disabled:bg-zinc-50"
                          spellCheck={false}
                        />
                        {CUSTOM_BG_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => updateField("customBgColor", preset.value)}
                            className="h-8 w-8 rounded-full border border-zinc-200 disabled:opacity-50"
                            style={{ backgroundColor: preset.value }}
                            aria-label={preset.label}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-medium">글자색</legend>
                      <p className="mt-1 text-xs text-zinc-500">
                        {content.heroLayout === "CANVAS"
                          ? "새로 추가하는 텍스트의 기본 색이에요. 각 텍스트는 나중에 따로 바꿀 수 있어요."
                          : "제목, 소개글 등 본문 글자색이에요."}{" "}
                        배경색과 대비가 잘 되는 색을 골라주세요.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="color"
                          disabled={!canEdit}
                          value={normalizeHexColor(
                            content.customTextColor,
                            DEFAULT_CUSTOM_TEXT_COLOR,
                          )}
                          onChange={(event) =>
                            updateField("customTextColor", event.target.value)
                          }
                          className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-white p-1 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          disabled={!canEdit}
                          value={content.customTextColor || DEFAULT_CUSTOM_TEXT_COLOR}
                          onChange={(event) =>
                            updateField("customTextColor", event.target.value)
                          }
                          className="w-28 rounded-lg border border-zinc-300 px-2 py-2 text-sm uppercase disabled:bg-zinc-50"
                          spellCheck={false}
                        />
                        {CUSTOM_TEXT_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => updateField("customTextColor", preset.value)}
                            className="h-8 w-8 rounded-full border border-zinc-200 disabled:opacity-50"
                            style={{ backgroundColor: preset.value }}
                            aria-label={preset.label}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ) : null}
              </AccordionRow>

              <AccordionRow
                title="헤드라인 폰트"
                summary={<span>{HEADING_FONT_LABELS[content.headingFont]}</span>}
                expanded={expandedSection === "font"}
                onToggle={() => toggleSection("font")}
              >
                <p className="mb-2 text-xs text-zinc-500">
                  도장 이름과 섹션 제목에 적용돼요. 나머지 글씨는 그대로예요.
                </p>
                <div className="space-y-2">
                  {HEADING_FONTS.map((font) => {
                    const selected = content.headingFont === font;
                    return (
                      <button
                        key={font}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => updateField("headingFont", font)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left disabled:opacity-50 ${
                          selected
                            ? "border-zinc-900 ring-2 ring-zinc-900"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                        aria-pressed={selected}
                      >
                        <span
                          className="truncate text-lg"
                          style={{ fontFamily: HEADING_FONT_VARS[font] }}
                        >
                          {content.name.trim() || "미리보기"}
                        </span>
                        <span className="ml-3 shrink-0 text-xs font-medium text-zinc-500">
                          {HEADING_FONT_LABELS[font]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </AccordionRow>

              <AccordionRow
                title="브랜드 컬러"
                summary={
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-zinc-200"
                    style={{
                      backgroundColor: normalizeHexColor(
                        content.brandColor,
                        DEFAULT_BRAND_COLOR,
                      ),
                    }}
                  />
                }
                expanded={expandedSection === "brand"}
                onToggle={() => toggleSection("brand")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="color"
                    name="brand_color"
                    disabled={!canEdit}
                    value={normalizeHexColor(content.brandColor, DEFAULT_BRAND_COLOR)}
                    onChange={(event) =>
                      updateField("brandColor", event.target.value)
                    }
                    className="h-10 w-14 cursor-pointer rounded border border-zinc-300 bg-white p-1 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={content.brandColor || DEFAULT_BRAND_COLOR}
                    onChange={(event) =>
                      updateField("brandColor", event.target.value)
                    }
                    className="w-28 rounded-lg border border-zinc-300 px-2 py-2 text-sm uppercase disabled:bg-zinc-50"
                    spellCheck={false}
                  />
                </div>
              </AccordionRow>

              <AccordionRow
                title="여백"
                summary={<span>{SECTION_SPACING_LABELS[content.sectionSpacing]}</span>}
                expanded={expandedSection === "spacing"}
                onToggle={() => toggleSection("spacing")}
              >
                <p className="mb-2 text-xs text-zinc-500">
                  섹션 사이 여백을 조절해요. 모든 디자인에 적용돼요.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SECTION_SPACINGS.map((spacing) => {
                    const selected = content.sectionSpacing === spacing;
                    return (
                      <button
                        key={spacing}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => updateField("sectionSpacing", spacing)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium disabled:opacity-50 ${
                          selected
                            ? "border-zinc-900 ring-2 ring-zinc-900"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                        aria-pressed={selected}
                      >
                        {SECTION_SPACING_LABELS[spacing]}
                      </button>
                    );
                  })}
                </div>
              </AccordionRow>
            </div>
          </SectionCard>

          <SectionCard icon={<TextIcon />} title="문구">
            <div className="divide-y divide-zinc-200">
              <AccordionRow
                title="반 소개 문구"
                summary={<span>{SECTION_TEXT_FIELDS.length}개 항목</span>}
                expanded={expandedTextSection === "classes"}
                onToggle={() => toggleTextSection("classes")}
              >
                <p className="mb-3 text-xs text-zinc-500">
                  홈페이지에 보이는 반 이름, 설명, 섹션 라벨을 직접 입력할 수 있어요.
                  비워두면 디자인 기본 문구가 표시돼요.
                </p>
                <div className="space-y-3">
                  {SECTION_TEXT_FIELDS.filter(
                    (field) => !field.key.startsWith("cta") && field.key !== "trialButtonText",
                  ).map((field) => (
                    <label key={field.key} className="block text-sm font-medium">
                      {field.label}
                      <input
                        type="text"
                        disabled={!canEdit}
                        value={content.sectionText[field.key] ?? ""}
                        onChange={(event) =>
                          updateSectionText(field.key, event.target.value)
                        }
                        placeholder={field.placeholder}
                        className={inputClassName}
                      />
                    </label>
                  ))}
                </div>
              </AccordionRow>

              <AccordionRow
                title="체험 신청 문구"
                summary={<span>4개 항목</span>}
                expanded={expandedTextSection === "cta"}
                onToggle={() => toggleTextSection("cta")}
              >
                <p className="mb-3 text-xs text-zinc-500">
                  체험 신청 섹션과 버튼에 쓰이는 문구예요.
                </p>
                <div className="space-y-3">
                  {SECTION_TEXT_FIELDS.filter(
                    (field) => field.key.startsWith("cta") || field.key === "trialButtonText",
                  ).map((field) => (
                    <label key={field.key} className="block text-sm font-medium">
                      {field.label}
                      <input
                        type="text"
                        disabled={!canEdit}
                        value={content.sectionText[field.key] ?? ""}
                        onChange={(event) =>
                          updateSectionText(field.key, event.target.value)
                        }
                        placeholder={field.placeholder}
                        className={inputClassName}
                      />
                    </label>
                  ))}
                </div>
              </AccordionRow>

              {SECTION_TEXT_LAYOUT_FIELDS[content.heroLayout]?.length ? (
                <AccordionRow
                  title="디자인 전용 문구"
                  summary={
                    <span>{HERO_LAYOUT_LABELS[content.heroLayout]} 전용</span>
                  }
                  expanded={expandedTextSection === "layout"}
                  onToggle={() => toggleTextSection("layout")}
                >
                  <p className="mb-3 text-xs text-zinc-500">
                    지금 선택한 &ldquo;{HERO_LAYOUT_LABELS[content.heroLayout]}&rdquo; 디자인에서만 보이는 문구예요.
                  </p>
                  <div className="space-y-3">
                    {SECTION_TEXT_LAYOUT_FIELDS[content.heroLayout]?.map((field) => (
                      <label key={field.key} className="block text-sm font-medium">
                        {field.label}
                        <input
                          type="text"
                          disabled={!canEdit}
                          value={content.sectionText[field.key] ?? ""}
                          onChange={(event) =>
                            updateSectionText(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          className={inputClassName}
                        />
                      </label>
                    ))}
                  </div>
                </AccordionRow>
              ) : null}
            </div>
          </SectionCard>
          </div>

          <div className="sticky bottom-0 z-10 space-y-3 border-t border-zinc-200 bg-white pt-3 pb-1">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canEdit || saving || !dirty}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </section>

      <section className="xl:sticky xl:top-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-zinc-600">실시간 미리보기</p>
          <p className="text-xs text-zinc-400">
            {content.heroLayout === "CANVAS"
              ? "텍스트를 드래그해서 옮기고, 더블클릭해서 고쳐 쓸 수 있어요"
              : "글자를 더블클릭하면 바로 수정할 수 있어요"}
          </p>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm max-xl:max-h-[70vh] max-xl:overflow-y-auto xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <div
            onDoubleClick={(event) => {
              if (!canEdit) {
                return;
              }
              const target = (event.target as HTMLElement).closest<HTMLElement>(
                "[data-editable-field]",
              );
              if (!target) {
                return;
              }
              const field = target.dataset.editableField;
              if (!field) {
                return;
              }
              beginInlineEdit(target, field);
            }}
          >
            <CanvasEditorContext.Provider
              value={{
                editable: canEdit,
                breakpoint: canvasBreakpoint,
                onBreakpointChange: setCanvasBreakpoint,
                onChange: updateCanvasElements,
              }}
            >
              <DojangLanding content={content} preview />
            </CanvasEditorContext.Provider>
          </div>
        </div>
      </section>
    </div>
  );
}
