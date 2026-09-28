"use client";

import { EVENT_CATEGORY_STYLES } from "@/components/calendar/categoryStyles";
import { formatDayTitle, formatTimeRange } from "@/lib/calendar";
import { EVENT_CATEGORY_LABELS, type CalendarEvent } from "@/types/calendar";

/**
 * 고른 날의 일정을 다이어리처럼 한 줄씩 크게 보여준다. 메모도 함께 보인다.
 * onEdit를 주면 일정을 눌러 고칠 수 있다(대시보드).
 */
export function DayAgenda({
  dateKey,
  events,
  onEdit,
  emptyText = "등록된 일정이 없어요.",
  action,
}: {
  dateKey: string;
  events: CalendarEvent[];
  onEdit?: (event: CalendarEvent) => void;
  emptyText?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">{formatDayTitle(dateKey)}</h3>
        {action}
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100">
          {events.map((event) => {
            const body = (
              <>
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_CATEGORY_STYLES[event.category].dot}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold">{event.title}</span>
                    <span
                      className={`rounded-full border px-1.5 py-px text-[11px] font-medium ${EVENT_CATEGORY_STYLES[event.category].chip}`}
                    >
                      {EVENT_CATEGORY_LABELS[event.category]}
                    </span>
                    {event.isPublic === false ? (
                      <span className="rounded-full bg-zinc-100 px-1.5 py-px text-[11px] font-medium text-zinc-600">
                        관장님만
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{formatTimeRange(event)}</p>
                  {event.memo ? (
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-zinc-700">
                      {event.memo}
                    </p>
                  ) : null}
                </div>
              </>
            );

            return (
              <li key={event.id}>
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    className="-mx-2 flex w-[calc(100%+1rem)] gap-3 rounded-lg px-2 py-3 text-left hover:bg-zinc-50"
                  >
                    {body}
                  </button>
                ) : (
                  <div className="flex gap-3 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
