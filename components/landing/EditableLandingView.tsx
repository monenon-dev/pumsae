"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { CanvasEditorContext } from "@/lib/dojang/canvas-context";
import { beginInlineTextEdit } from "@/lib/dojang/inline-edit";
import { updateMyDojang } from "@/lib/api/dashboard";
import {
  withNormalizedHeroLayout,
  type CanvasBreakpoint,
  type CanvasTextElement,
  type DojangLandingContent,
} from "@/types/dojang";

type EditableLandingViewProps = {
  initial: DojangLandingContent;
};

export function EditableLandingView({ initial }: EditableLandingViewProps) {
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState(() => withNormalizedHeroLayout(initial));
  const [canvasBreakpoint, setCanvasBreakpoint] = useState<CanvasBreakpoint>("desktop");
  const canvasSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = !authLoading && user?.dojangId === content.id;

  function save(partial: Record<string, unknown>) {
    updateMyDojang(partial)
      .then((next) => setContent(next))
      .catch(() => {
        // Live-edit save failures are non-blocking; the field keeps its
        // optimistic local value and the owner can retry from the dashboard.
      });
  }

  function updateNameOrDescription(field: "name" | "description", value: string) {
    setContent((current) => ({ ...current, [field]: value }));
    save({ [field]: field === "description" ? value || null : value });
  }

  function updateSectionTextLive(key: string, value: string) {
    setContent((current) => {
      const nextSectionText = { ...current.sectionText, [key]: value };
      save({ sectionText: nextSectionText });
      return { ...current, sectionText: nextSectionText };
    });
  }

  function updateCanvasElementsLive(
    updater: (elements: CanvasTextElement[]) => CanvasTextElement[],
  ) {
    setContent((current) => {
      const nextElements = updater(current.canvasElements);
      if (canvasSaveTimer.current) {
        clearTimeout(canvasSaveTimer.current);
      }
      canvasSaveTimer.current = setTimeout(() => {
        save({ canvasElements: nextElements });
      }, 600);
      return { ...current, canvasElements: nextElements };
    });
  }

  function beginInlineEdit(target: HTMLElement, field: string) {
    beginInlineTextEdit(target, {
      multiline: field === "description",
      onCommit: (text) => {
        if (field === "name" || field === "description") {
          updateNameOrDescription(field, text);
        } else {
          updateSectionTextLive(field, text);
        }
      },
    });
  }

  if (!isOwner) {
    return <DojangLanding content={content} />;
  }

  return (
    <CanvasEditorContext.Provider
      value={{
        editable: true,
        breakpoint: canvasBreakpoint,
        onBreakpointChange: setCanvasBreakpoint,
        onChange: updateCanvasElementsLive,
      }}
    >
      <div
        onDoubleClick={(event) => {
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
        <DojangLanding content={content} />
      </div>

      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-2 text-xs text-white shadow-lg">
        <span>관장님만 보이는 편집 모드 · 글자를 더블클릭해서 수정하세요</span>
        <Link href="/dashboard/landing" className="font-semibold underline">
          전체 편집
        </Link>
        <Link href="/dashboard/templates" className="font-semibold underline">
          카드뉴스
        </Link>
        <Link href="/dashboard/trials" className="font-semibold underline">
          체험 신청
        </Link>
      </div>
    </CanvasEditorContext.Provider>
  );
}
