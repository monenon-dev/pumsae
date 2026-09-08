export function getApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return raw.replace(/\/$/, "");
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "INSTRUCTOR";
  dojangId: string | null;
};

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function parseApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
    const first = detail[0] as { msg?: unknown };
    if (typeof first.msg === "string" && first.msg.trim()) {
      return first.msg;
    }
  }

  return fallback;
}
