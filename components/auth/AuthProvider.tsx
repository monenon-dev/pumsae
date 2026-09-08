"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  register as registerRequest,
} from "@/lib/api/auth";
import { setAccessToken, subscribeAccessToken } from "@/lib/api/client";
import type { AuthUser, TokenResponse } from "@/lib/api/types";

type Credentials = {
  email: string;
  password: string;
};

type RegisterInput = Credentials & {
  dojangName: string;
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (input: Credentials) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((session: TokenResponse | null) => {
    const token = session?.accessToken ?? null;
    setAccessToken(token);
    setToken(token);
    setUser(session?.user ?? null);
  }, []);

  useEffect(() => {
    return subscribeAccessToken((token) => {
      setToken(token);
      if (!token) {
        setUser(null);
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await refreshSession();
        if (!cancelled) {
          applySession(session);
        }
      } catch {
        if (!cancelled) {
          applySession(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      async login(input) {
        applySession(await loginRequest(input));
      },
      async register(input) {
        applySession(await registerRequest(input));
      },
      async logout() {
        await logoutRequest();
        applySession(null);
      },
    }),
    [accessToken, applySession, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
