"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DayAgenda } from "@/components/calendar/DayAgenda";
import { EventFormDialog } from "@/components/calendar/EventFormDialog";
import { MonthCalendar, MonthCalendarHeader } from "@/components/calendar/MonthCalendar";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "@/lib/api/events";
import { gridRange, startOfMonth, toDateKey } from "@/lib/calendar";
import type { CalendarEvent, CalendarEventInput } from "@/types/calendar";

type Filter = "all" | "public" | "private";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "public", label: "학부모 공개" },
  { value: "private", label: "관장님만" },
];

type DialogState = { dateKey: string; event: CalendarEvent | null } | null;

export default function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [dialog, setDialog] = useState<DialogState>(null);

  const load = useCallback(async (target: Date) => {
    const { from, to } = gridRange(target);
    setLoading(true);
    try {
      setEvents(await fetchEvents(from, to));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(month);
  }, [load, month]);

  const visible = useMemo(
    () =>
      events.filter((event) =>
        filter === "all" ? true : filter === "public" ? event.isPublic : !event.isPublic,
      ),
    [events, filter],
  );
  const selectedEvents = visible.filter((event) => event.date === selectedDate);

  function changeMonth(next: Date) {
    setMonth(startOfMonth(next));
    const today = new Date();
    // "오늘"을 누르면 오늘을, 다른 달로 넘기면 그 달 1일을 고른다.
    setSelectedDate(
      next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth()
        ? toDateKey(today)
        : toDateKey(startOfMonth(next)),
    );
  }

  async function submit(input: CalendarEventInput) {
    if (dialog?.event) {
      await updateEvent(dialog.event.id, input);
    } else {
      await createEvent(input);
    }
    setDialog(null);
    setSelectedDate(input.date);
    await load(month);
  }

  async function remove() {
    if (!dialog?.event) return;
    await deleteEvent(dialog.event.id);
    setDialog(null);
    await load(month);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">캘린더</h1>
          <p className="mt-2 text-sm text-zinc-600">
            수업과 행사를 날짜별로 적어 두세요. &quot;학부모에게 공개&quot;한 일정은
            내 홈페이지 캘린더에도 보여요.
          </p>
        </div>
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 text-sm shadow-sm">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded-md px-3 py-1.5 ${
                filter === item.value
                  ? "bg-zinc-900 font-semibold text-white"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <MonthCalendarHeader
          month={month}
          onMonthChange={changeMonth}
          actions={
            <button
              type="button"
              onClick={() => setDialog({ dateKey: selectedDate, event: null })}
              className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              + 일정 추가
            </button>
          }
        />
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <div className={`mt-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <MonthCalendar
            month={month}
            events={visible}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onEventClick={(event) => setDialog({ dateKey: event.date, event })}
          />
        </div>
      </div>

      <DayAgenda
        dateKey={selectedDate}
        events={selectedEvents}
        onEdit={(event) => setDialog({ dateKey: event.date, event })}
        emptyText="이 날은 일정이 없어요. 오른쪽 버튼으로 추가해 보세요."
        action={
          <button
            type="button"
            onClick={() => setDialog({ dateKey: selectedDate, event: null })}
            className="text-sm font-medium text-zinc-900 underline"
          >
            이 날에 추가
          </button>
        }
      />

      {dialog ? (
        <EventFormDialog
          key={dialog.event?.id ?? `new-${dialog.dateKey}`}
          dateKey={dialog.dateKey}
          event={dialog.event}
          onClose={() => setDialog(null)}
          onSubmit={submit}
          onDelete={dialog.event ? remove : undefined}
        />
      ) : null}
    </section>
  );
}
