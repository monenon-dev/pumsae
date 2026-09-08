"use client";

import {
  ApiError,
  getApiUrl,
  parseApiError,
  type TokenResponse,
} from "@/lib/api/types";

// Access token stays in memory only (module + AuthContext). Never localStorage.
let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
const tokenListeners = new Set<(token: string | null) => void>();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  tokenListeners.forEach((listener) => listener(token));
}

export function subscribeAccessToken(
  listener: (token: string | null) => void,
): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  const path = window.location.pathname;
  if (!path.startsWith("/dashboard")) {
    return;
  }

  const next = encodeURIComponent(`${path}${window.location.search}`);
  window.location.replace(`/login?next=${next}`);
}

function shouldAttemptRefresh(path: string): boolean {
  return !path.startsWith("/auth/");
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401 || !retry || !shouldAttemptRefresh(path)) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    redirectToLogin();
    return response;
  }

  return apiFetch(path, init, false);
}

export async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function throwIfNotOk(
  response: Response,
  fallback = "요청을 처리하지 못했습니다.",
): Promise<void> {
  if (response.ok) {
    return;
  }

  const payload = await response.json().catch(() => null);
  throw new ApiError(parseApiError(payload, fallback), response.status);
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setAccessToken(null);
        return false;
      }

      const payload = (await response.json()) as TokenResponse;
      setAccessToken(payload.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(path, init);
  await throwIfNotOk(response);
  if (response.status === 204) {
    return undefined as T;
  }
  return readJson<T>(response);
}
