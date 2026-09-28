export const EVENT_CATEGORIES = ["CLASS", "EVENT", "CLOSED", "NOTICE"] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  CLASS: "수업",
  EVENT: "행사",
  CLOSED: "휴관",
  NOTICE: "공지",
};

/** 달력에 그리는 일정. 대시보드·공개 홈페이지가 같이 쓴다. */
export type CalendarEvent = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  /** HH:MM, 없으면 하루 종일 */
  startTime: string | null;
  endTime: string | null;
  memo: string | null;
  category: EventCategory;
  /** 대시보드에서만 온다. 공개 홈페이지 일정은 모두 공개다. */
  isPublic?: boolean;
};

export type CalendarEventInput = {
  date: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  memo: string | null;
  category: EventCategory;
  isPublic: boolean;
};
