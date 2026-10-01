"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { PumsaeLogo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-pumsae-bg text-pumsae-ink">
        <header className="sticky top-0 z-20 border-b border-pumsae-line bg-pumsae-bg">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="shrink-0">
              <PumsaeLogo />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <ProfileSettings />
        </div>
      </div>
    </AuthGuard>
  );
}
