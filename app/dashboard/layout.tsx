"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <DashboardHeader />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">{children}</div>
      </div>
    </AuthGuard>
  );
}
