"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { POST_LOGIN_PATH } from "@/lib/auth/post-login";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) {
      return;
    }

    const next = `${window.location.pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, router, user]);

  if (loading) {
    return (
      <p className="px-4 py-10 text-center text-sm text-zinc-500">
        로그인 상태를 확인하는 중...
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    router.replace(POST_LOGIN_PATH);
  }, [loading, router, user]);

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">로그인 상태를 확인하는 중...</p>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
