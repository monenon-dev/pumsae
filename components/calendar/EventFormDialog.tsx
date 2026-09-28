"use client";

import { FormEvent, useEffect, useState } from "react";
import { EVENT_CATEGORY_STYLES } from "@/components/calendar/categoryStyles";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  type CalendarEvent,
  type CalendarEventInput,
  type EventCategory,
} from "@/types/calendar";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

/** 일정 추가·수정 창. event가 있으면 수정, 없으면 dateKey 날짜에 새로 추가. */
export function EventFormDialog({
  dateKey,
  event,
  onClose,
  onSubmit,
  onDelete,
}: {
  dateKey: string;
  event: CalendarEvent | null;
  onClose: () => void;
  onSubmit: (input: CalendarEventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [date, setDate] = useState(event?.date ?? dateKey);
  const [title, setTitle] = useState(event?.title ?? "");
  const [category, setCategory] = useState<EventCategory>(event?.category ?? "CLASS");
  const [allDay, setAllDay] = useState(event ? !event.startTime : false);
  const [startTime, setStartTime] = useState(event?.startTime ?? "16:00");
  const [endTime, setEndTime] = useState(event?.endTime ?? "17:00");
  const [memo, setMemo] = useState(event?.memo ?? "");
  const [isPublic, setIsPublic] = useState(event?.isPublic ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "저장하지 못했습니다.");
      setBusy(false);
    }
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!title.trim()) {
      setError("일정 제목을 입력해 주세요.");
      return;
    }
    if (!allDay && endTime && startTime && endTime < startTime) {
      setError("끝나는 시간이 시작 시간보다 빨라요.");
      return;
    }
    void run(() =>
      onSubmit({
        date,
        title: title.trim(),
        category,
        startTime: allDay ? null : startTime || null,
        endTime: allDay ? null : endTime || null,
        memo: memo.trim() || null,
        isPublic,
      }),
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event ? "일정 수정" : "일정 추가"}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold">{event ? "일정 수정" : "일정 추가"}</h2>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            제목
            <input
              autoFocus
              value={title}
              onChange={(changeEvent) => setTitle(changeEvent.target.value)}
              maxLength={80}
              className={inputClassName}
              placeholder="예: 유치부 수업, 승급 심사"
            />
          </label>

          <div className="text-sm font-medium">
            종류
            <div className="mt-1.5 flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  aria-pressed={category === value}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    category === value
                      ? `${EVENT_CATEGORY_STYLES[value].chip} font-semibold ring-2 ring-zinc-900/10`
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {EVENT_CATEGORY_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-medium">
            날짜
            <input
              type="date"
              required
              value={date}
              onChange={(changeEvent) => setDate(changeEvent.target.value)}
              className={inputClassName}
            />
          </label>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(changeEvent) => setAllDay(changeEvent.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              하루 종일
            </label>
            {allDay ? null : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">
                  시작
                  <input
                    type="time"
                    value={startTime}
                    onChange={(changeEvent) => setStartTime(changeEvent.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label className="block text-sm font-medium">
                  끝
                  <input
                    type="time"
                    value={endTime}
                    onChange={(changeEvent) => setEndTime(changeEvent.target.value)}
                    className={inputClassName}
                  />
                </label>
              </div>
            )}
          </div>

          <label className="block text-sm font-medium">
            메모
            <textarea
              rows={4}
              value={memo}
              onChange={(changeEvent) => setMemo(changeEvent.target.value)}
              maxLength={1000}
              className={inputClassName}
              placeholder="수업 내용, 준비물, 안내 사항을 적어 두세요."
            />
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(changeEvent) => setIsPublic(changeEvent.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            />
            <span>
              <span className="font-medium">학부모에게 공개</span>
              <span className="block text-xs text-zinc-500">
                끄면 관장님·사범님만 대시보드에서 볼 수 있어요.
              </span>
            </span>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 flex items-center gap-2">
          {onDelete ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm("이 일정을 삭제할까요?")) {
                  void run(onDelete);
                }
              }}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              삭제
            </button>
          ) : null}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {busy ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
