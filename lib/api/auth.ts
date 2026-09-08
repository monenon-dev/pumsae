"use client";

import { apiFetch, setAccessToken, throwIfNotOk } from "@/lib/api/client";
import type { TokenResponse } from "@/lib/api/types";

export async function register(input: {
  dojangName: string;
  name: string;
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const response = await apiFetch(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    false,
  );
  await throwIfNotOk(response, "회원가입에 실패했습니다.");
  const payload = (await response.json()) as TokenResponse;
  setAccessToken(payload.accessToken);
  return payload;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const response = await apiFetch(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    false,
  );
  await throwIfNotOk(response, "로그인에 실패했습니다.");
  const payload = (await response.json()) as TokenResponse;
  setAccessToken(payload.accessToken);
  return payload;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" }, false);
  } finally {
    setAccessToken(null);
  }
}

export async function refreshSession(): Promise<TokenResponse | null> {
  try {
    const response = await apiFetch("/auth/refresh", { method: "POST" }, false);
    if (!response.ok) {
      setAccessToken(null);
      return null;
    }

    const payload = (await response.json()) as TokenResponse;
    setAccessToken(payload.accessToken);
    return payload;
  } catch {
    setAccessToken(null);
    return null;
  }
}
