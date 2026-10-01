"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { HomeHero } from "@/components/home/HomeHero";
import { MobileAppSection } from "@/components/home/MobileAppSection";
import { PumsaeLogo } from "@/components/ui/Logo";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function LandingHome() {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  return (
    <div className="min-h-screen bg-pumsae-bg text-pumsae-ink">
      <header className="border-b border-pumsae-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <PumsaeLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <ProfileMenu />
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-pumsae-accent px-3.5 py-2 text-sm font-semibold text-pure-white hover:bg-pumsae-accent-dark"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <HomeHero isLoggedIn={isLoggedIn} />

        <FeatureShowcase />

        <MobileAppSection />
      </main>

      <footer className="border-t border-pumsae-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-sm text-pumsae-muted sm:px-6">
          <PumsaeLogo />
          <Link href="/privacy" className="text-xs hover:text-pumsae-ink hover:underline">
            개인정보처리방침
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return <LandingHome />;
}
