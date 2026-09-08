"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAccessToken, refreshAccessToken } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import {
  fetchTrialRequests,
  getTrialRequestsWsUrl,
  updateTrialRequestStatus,
} from "@/lib/api/trials";
import {
  DESIRED_CLASS_LABELS,
  TRIAL_STATUS_LABELS,
  type TrialRequest,
  type TrialRequestStatus,
} from "@/types/trial-request";

type Toast = {
  id: number;
  text: string;
};

function statusClass(status: TrialRequestStatus): string {
  if (status === "CONFIRMED") {
    return "bg-emerald-50 text-emerald-800";
  }
  if (status === "DECLINED") {
    return "bg-zinc-100 text-zinc-600";
  }
  return "bg-amber-50 text-amber-800";
}

export default function TrialsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<TrialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((text: string) => {
    const id = toastId.current + 1;
    toastId.current = id;
    setToasts((current) => [...current, { id, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchTrialRequests()
      .then((rows) => {
        if (!cancelled) {
          setItems(rows);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "신청 목록을 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    async function connect() {
      if (cancelled) {
        return;
      }
      let token = getAccessToken();
      if (!token) {
        await refreshAccessToken();
        token = getAccessToken();
      }
      if (!token || cancelled) {
        return;
      }

      const ws = new WebSocket(getTrialRequestsWsUrl(token));
      socket = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            trial?: TrialRequest;
          };
          if (payload.type !== "trial.created" || !payload.trial?.id) {
            return;
          }
          const trial = payload.trial;
          setItems((current) => {
            if (current.some((item) => item.id === trial.id)) {
              return current;
            }
            return [trial, ...current];
          });
          pushToast(`${trial.studentName} 학생 체험 신청이 들어왔습니다.`);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (cancelled) {
          return;
        }
        reconnectTimer = window.setTimeout(() => {
          void connect();
        }, 4000);
      };
    }

    void connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [accessToken, pushToast]);

  async function handleStatus(
    id: string,
    status: Exclude<TrialRequestStatus, "PENDING">,
  ) {
    setUpdatingId(id);
    try {
      const updated = await updateTrialRequestStatus(id, status);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (updateError) {
      window.alert(
        updateError instanceof Error
          ? updateError.message
          : "상태를 바꾸지 못했습니다.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section>
      <div className="fixed right-4 top-20 z-30 flex w-[min(100%-2rem,20rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <p
            key={toast.id}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
            role="status"
          >
            {toast.text}
          </p>
        ))}
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">체험 신청</h1>
      <p className="mt-2 text-sm text-zinc-600">
        학부모 신청이 들어오면 이 목록 맨 위에 바로 표시됩니다.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-zinc-500">목록을 불러오는 중...</p>
      ) : error ? (
        <p className="mt-8 text-sm text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-600">아직 들어온 신청이 없습니다.</p>
          <p className="mt-2 text-sm text-zinc-500">
            공개 랜딩페이지에서 학부모가 신청하면 여기에 나타납니다.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{item.studentName}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    보호자 {item.parentName} · {item.parentPhone}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}
                >
                  {TRIAL_STATUS_LABELS[item.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                {item.desiredClass
                  ? DESIRED_CLASS_LABELS[item.desiredClass]
                  : "희망 반 미정"}
                {" · "}
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </p>
              {item.memo ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                  {item.memo}
                </p>
              ) : null}
              {item.status === "PENDING" ? (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => void handleStatus(item.id, "CONFIRMED")}
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    확정
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => void handleStatus(item.id, "DECLINED")}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    거절
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
