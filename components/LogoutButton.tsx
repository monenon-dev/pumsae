"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
      }
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
