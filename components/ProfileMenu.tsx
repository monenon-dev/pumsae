"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export function ProfileMenu() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.name.trim() || user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Link
      href="/profile"
      aria-label="프로필 보기"
      className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-pumsae-ink transition-colors hover:bg-pumsae-line"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pumsae-accent text-sm font-semibold text-pure-white">
        {initial}
      </span>
      <span>{displayName}님</span>
    </Link>
  );
}
