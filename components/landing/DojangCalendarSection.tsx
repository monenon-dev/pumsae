"use client";

import { useEffect, useState } from "react";
import { DayAgenda } from "@/components/calendar/DayAgenda";
import { MonthCalendar, MonthCalendarHeader } from "@/components/calendar/MonthCalendar";
import { fetchPublicEvents } from "@/lib/api/events";
import { sectionPaddingClass } from "@/lib/dojang/brand";
import { getCopy } from "@/lib/dojang/copy";
import { formatDayTitle, gridRange, startOfMonth, toDateKey } from "@/lib/calendar";
import type { CalendarEvent } from "@/types/calendar";
import { HEADING_FONT_VARS, type DojangLandingContent } from "@/types/dojang";

/**
 * 공개 홈페이지의 "수업·행사 일정". 관장님이 학부모에게 공개한 일정만 보이고,
 * 공개 일정이 하나도 없으면 섹션을 숨긴다. 편집기 미리보기(preview)에서는
 * 그리지 않는다.
 */
export function DojangCalendarSection({
  content,
  preview = false,
}: {
  content: DojangLandingContent;
  preview?: boolean;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hasAny, setHasAny] = useState(false);

  useEffect(() => {
    if (preview) return;
    let cancelled = false;
    const { from, to } = gridRange(month);
    void fetchPublicEvents(content.slug, from, to)
      .then((result) => {
        if (cancelled) return;
        setEvents(result.events);
        setHasAny(result.hasAny);
      })
      .catch(() => {
        // 일정은 부가 정보라 불러오지 못해도 페이지는 그대로 둔다.
      });
    return () => {
      cancelled = true;
    };
  }, [content.slug, month, preview]);

  if (preview || !hasAny) {
    return null;
  }

  // "공지"로 등록한 일정은 날짜를 누르지 않아도 보이도록 달력 위에 메모까지 펼친다.
  const monthPrefix = toDateKey(month).slice(0, 7);
  const notices = events.filter(
    (event) => event.category === "NOTICE" && event.date.startsWith(monthPrefix),
  );

  function changeMonth(next: Date) {
    setMonth(startOfMonth(next));
    const today = new Date();
    setSelectedDate(
      next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth()
        ? toDateKey(today)
        : toDateKey(startOfMonth(next)),
    );
  }

  return (
    <section
      className={`border-t px-5 sm:px-8 ${sectionPaddingClass(content.sectionSpacing, "py-14")}`}
      style={{ borderColor: "color-mix(in srgb, currentColor 12%, transparent)" }}
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--landing-brand)" }}
        >
          {getCopy(content, "calendarEyebrow", "Calendar")}
        </p>
        <h2
          className="mt-2 text-2xl font-semibold tracking-tight"
          style={{ fontFamily: HEADING_FONT_VARS[content.headingFont] }}
        >
          {getCopy(content, "calendarTitle", "수업·행사 일정")}
        </h2>

        {/* 디자인 배경색과 상관없이 읽기 쉽도록 달력은 흰 판 위에 그린다. */}
        <div className="mt-7 rounded-2xl bg-white p-4 text-zinc-900 shadow-sm sm:p-5">
          <MonthCalendarHeader month={month} onMonthChange={changeMonth} />
          {notices.length > 0 ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <h3 className="text-sm font-semibold text-emerald-900">
                {month.getMonth() + 1}월 안내
              </h3>
              <ul className="mt-2 divide-y divide-emerald-100">
                {notices.map((notice) => (
                  <li key={notice.id} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(notice.date)}
                      className="w-full text-left"
                    >
                      <p className="text-xs font-medium text-emerald-700">
                        {formatDayTitle(notice.date)}
                      </p>
                      <p className="mt-0.5 font-semibold text-zinc-900">{notice.title}</p>
                      {notice.memo ? (
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-700">
                          {notice.memo}
                        </p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4">
            <MonthCalendar
              month={month}
              events={events}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          <div className="mt-4">
            <DayAgenda
              dateKey={selectedDate}
              events={events.filter((event) => event.date === selectedDate)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
