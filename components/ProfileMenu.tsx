"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogoutButton } from "@/components/LogoutButton";

const MENU_ITEMS = [
  { href: "/dashboard/landing", label: "대시보드" },
  { href: "/dashboard/profile", label: "프로필" },
];

export function ProfileMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const displayName = user.name.trim() || user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-pumsae-ink transition-colors hover:bg-pumsae-line"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pumsae-accent text-sm font-semibold text-white">
          {initial}
        </span>
        <span>{displayName}님</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className={`h-4 w-4 text-pumsae-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-pumsae-line bg-white py-1 shadow-lg"
        >
          <div className="border-b border-pumsae-line px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-pumsae-ink">
              {displayName}님
            </p>
            <p className="truncate text-xs text-pumsae-muted">{user.email}</p>
          </div>
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-pumsae-ink hover:bg-pumsae-bg"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-pumsae-line pt-1">
            <LogoutButton className="flex w-full items-center gap-1.5 px-4 py-2 text-left text-sm text-pumsae-muted hover:bg-pumsae-bg hover:text-pumsae-ink disabled:pointer-events-none disabled:opacity-60" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
