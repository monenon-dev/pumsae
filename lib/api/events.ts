"use client";

import { apiJson } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/types";
import type { CalendarEvent, CalendarEventInput } from "@/types/calendar";

export async function fetchEvents(from: string, to: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({ from, to });
  return apiJson<CalendarEvent[]>(`/dashboard/events?${params.toString()}`);
}

export async function createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  return apiJson<CalendarEvent>("/dashboard/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEvent(
  id: string,
  input: CalendarEventInput,
): Promise<CalendarEvent> {
  return apiJson<CalendarEvent>(`/dashboard/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiJson<void>(`/dashboard/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export type PublicEvents = { events: CalendarEvent[]; hasAny: boolean };

/** 공개 홈페이지용. 로그인 없이 학부모 공개 일정만 받는다. */
export async function fetchPublicEvents(
  slug: string,
  from: string,
  to: string,
): Promise<PublicEvents> {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(
    `${getApiUrl()}/dojangs/${encodeURIComponent(slug)}/events?${params.toString()}`,
  );
  if (!response.ok) {
    return { events: [], hasAny: false };
  }
  return (await response.json()) as PublicEvents;
}
