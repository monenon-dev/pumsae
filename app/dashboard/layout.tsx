"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatusProvider } from "@/components/dashboard/DashboardStatusProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardStatusProvider>
        <div className="min-h-screen bg-pumsae-bg text-pumsae-ink">
          <DashboardHeader />
          <OnboardingBanner />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </DashboardStatusProvider>
    </AuthGuard>
  );
}
