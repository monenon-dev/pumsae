"use client";

import { apiJson } from "@/lib/api/client";
import { ApiError, getApiUrl, parseApiError } from "@/lib/api/types";
import type {
  DesiredClass,
  TrialRequest,
  TrialRequestStatus,
} from "@/types/trial-request";

export type CreateTrialRequestInput = {
  dojangId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  desiredClass?: DesiredClass | null;
  memo?: string | null;
};

export async function createTrialRequest(
  input: CreateTrialRequestInput,
): Promise<TrialRequest> {
  const response = await fetch(`${getApiUrl()}/trial-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      parseApiError(payload, "신청을 보내지 못했습니다. 입력 내용을 확인해 주세요."),
      response.status,
    );
  }

  return (await response.json()) as TrialRequest;
}

export async function fetchTrialRequests(): Promise<TrialRequest[]> {
  return apiJson<TrialRequest[]>("/dashboard/trial-requests");
}

export async function updateTrialRequestStatus(
  id: string,
  status: Exclude<TrialRequestStatus, "PENDING">,
): Promise<TrialRequest> {
  return apiJson<TrialRequest>(
    `/dashboard/trial-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function getTrialRequestsWsUrl(token: string): string {
  const url = new URL(
    `${getApiUrl().replace(/^http/i, "ws")}/ws/dashboard/trial-requests`,
  );
  url.searchParams.set("token", token);
  return url.toString();
}
