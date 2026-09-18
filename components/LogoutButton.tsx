"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

type LogoutButtonProps = {
  className?: string;
};

function LogoutIcon({ spinning = false }: { spinning?: boolean }) {
  if (spinning) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        className="h-4 w-4 animate-spin"
        aria-hidden
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      // A client-side router.replace races AuthGuard's own redirect-to-login
      // effect (it fires the moment `user` becomes null while still on a
      // protected route). A hard navigation sidesteps that entirely.
      window.location.href = "/login";
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
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-pumsae-muted transition-colors hover:bg-pumsae-line hover:text-pumsae-ink disabled:pointer-events-none disabled:opacity-60"
      }
    >
      <LogoutIcon spinning={loading} />
      로그아웃
    </button>
  );
}
