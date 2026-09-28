import type { EventCategory } from "@/types/calendar";

// Tailwind가 클래스를 찾을 수 있도록 components/ 아래에 둔다.
/** 달력 칩 색. 테두리·배경·글자·점 색을 한 번에 정한다. */
export const EVENT_CATEGORY_STYLES: Record<
  EventCategory,
  { chip: string; dot: string }
> = {
  CLASS: { chip: "border-sky-200 bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  EVENT: { chip: "border-rose-200 bg-rose-50 text-rose-800", dot: "bg-rose-500" },
  CLOSED: { chip: "border-zinc-200 bg-zinc-100 text-zinc-600", dot: "bg-zinc-400" },
  NOTICE: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
};
