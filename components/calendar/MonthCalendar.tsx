"use client";

import { EVENT_CATEGORY_STYLES } from "@/components/calendar/categoryStyles";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatMonthTitle,
  groupByDate,
  monthGrid,
  toDateKey,
} from "@/lib/calendar";
import type { CalendarEvent } from "@/types/calendar";

const MAX_CHIPS = 3;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden>
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 달력 위쪽: 오늘 날짜 배지, 몇 년 몇 월, 이전/오늘/다음, 오른쪽 버튼 자리. */
export function MonthCalendarHeader({
  month,
  onMonthChange,
  actions,
}: {
  month: Date;
  onMonthChange: (month: Date) => void;
  actions?: React.ReactNode;
}) {
  const today = new Date();
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const m = month.getMonth() + 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex w-12 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white text-center shadow-sm">
          <span className="bg-zinc-50 py-0.5 text-[10px] font-semibold text-zinc-500">
            {today.getMonth() + 1}월
          </span>
          <span className="py-0.5 text-lg font-bold leading-6 text-zinc-900">
            {today.getDate()}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
            {formatMonthTitle(month)}
          </h2>
          <p className="text-xs text-zinc-500">
            {m}월 1일 – {m}월 {lastDay}일
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm text-zinc-700 shadow-sm">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            aria-label="이전 달"
            className="px-2.5 py-2 hover:bg-zinc-50"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(today, 0))}
            className="border-x border-zinc-200 px-3 py-1.5 font-medium hover:bg-zinc-50"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            aria-label="다음 달"
            className="px-2.5 py-2 hover:bg-zinc-50"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
        {actions}
      </div>
    </div>
  );
}

/**
 * 월요일로 시작하는 월간 달력. 칸을 누르면 그날을 고르고, 일정 칩을 누르면
 * onEventClick이 불린다. 좁은 화면에서는 칩 대신 색 점만 보여준다.
 */
export function MonthCalendar({
  month,
  events,
  selectedDate,
  onSelectDate,
  onEventClick,
}: {
  month: Date;
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const days = monthGrid(month);
  const byDate = groupByDate(events);
  const todayKey = toDateKey(new Date());

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-900">
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 text-center text-xs font-medium text-zinc-500">
        {WEEKDAY_LABELS.map((label, index) => (
          <div
            key={label}
            className={`py-2 ${index === 5 ? "text-sky-600" : index === 6 ? "text-rose-600" : ""}`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const key = toDateKey(day);
          const inMonth = day.getMonth() === month.getMonth();
          const dayEvents = byDate.get(key) ?? [];
          const hidden = dayEvents.length - MAX_CHIPS;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              aria-label={`${day.getMonth() + 1}월 ${day.getDate()}일, 일정 ${dayEvents.length}개`}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(key)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectDate(key);
                }
              }}
              className={`min-h-[4.25rem] cursor-pointer border-zinc-200 p-1 text-left outline-none transition-colors sm:min-h-[7.5rem] sm:p-1.5 ${
                index % 7 !== 6 ? "border-r" : ""
              } ${index < days.length - 7 ? "border-b" : ""} ${
                inMonth ? "bg-white hover:bg-zinc-50" : "bg-zinc-50/70 text-zinc-400 hover:bg-zinc-100/70"
              } ${isSelected ? "ring-2 ring-inset ring-zinc-900" : "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400"}`}
            >
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium ${
                  isToday ? "bg-zinc-900 text-white" : ""
                }`}
              >
                {day.getDate()}
              </span>

              {/* 넓은 화면: 일정 칩 */}
              <ul className="mt-1 hidden space-y-1 sm:block">
                {dayEvents.slice(0, MAX_CHIPS).map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onSelectDate(key);
                        onEventClick?.(event);
                      }}
                      className={`flex w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-left text-[11px] leading-4 ${
                        EVENT_CATEGORY_STYLES[event.category].chip
                      } ${inMonth ? "" : "opacity-60"} ${event.isPublic === false ? "border-dashed" : ""}`}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
                      {event.startTime ? (
                        <span className="shrink-0 opacity-70">{event.startTime}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
                {hidden > 0 ? (
                  <li className="px-1 text-[11px] font-medium text-zinc-500">{hidden}개 더…</li>
                ) : null}
              </ul>

              {/* 좁은 화면: 색 점 */}
              {dayEvents.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {dayEvents.slice(0, 4).map((event) => (
                    <span
                      key={event.id}
                      className={`h-1.5 w-1.5 rounded-full ${EVENT_CATEGORY_STYLES[event.category].dot}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
