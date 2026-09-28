import type { CalendarEvent } from "@/types/calendar";

export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** 로컬 날짜를 YYYY-MM-DD로. (toISOString은 UTC라 하루가 밀릴 수 있다) */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/**
 * 월요일로 시작하는 달력 칸. 앞뒤 달 날짜로 주를 채우고, 그 달이 걸친 주만큼
 * (4~6주) 만든다.
 */
export function monthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % 7; // 월=0 … 일=6
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((offset + lastDay) / 7);
  return Array.from(
    { length: weeks * 7 },
    (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

/** 달력 한 화면에 보이는 첫날·마지막날(서버 조회 범위). */
export function gridRange(month: Date): { from: string; to: string } {
  const days = monthGrid(month);
  return { from: toDateKey(days[0]), to: toDateKey(days[days.length - 1]) };
}

export function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
  }
  return map;
}

export function formatMonthTitle(month: Date): string {
  return `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
}

export function formatDayTitle(key: string): string {
  const date = parseDateKey(key);
  const weekday = WEEKDAY_LABELS[(date.getDay() + 6) % 7];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

export function formatTimeRange(event: Pick<CalendarEvent, "startTime" | "endTime">): string {
  if (!event.startTime) return "하루 종일";
  return event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime;
}
