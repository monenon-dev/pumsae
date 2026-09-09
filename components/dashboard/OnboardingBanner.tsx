"use client";

import { usePathname } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { useDashboardStatus } from "@/components/dashboard/DashboardStatusProvider";

export function OnboardingBanner() {
  const pathname = usePathname();
  const { loading, landingSaved } = useDashboardStatus();

  if (loading || landingSaved || pathname === "/dashboard/landing") {
    return null;
  }

  return (
    <Banner actionLabel="랜딩페이지 만들기 →" actionHref="/dashboard/landing">
      아직 홍보 페이지가 없어요. 랜딩페이지부터 만들어보세요
    </Banner>
  );
}
