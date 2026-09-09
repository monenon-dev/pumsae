"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { fetchMyDojang, fetchMyTemplates } from "@/lib/api/dashboard";
import { fetchTrialRequests } from "@/lib/api/trials";
import type { DojangLandingContent } from "@/types/dojang";

type DashboardStatus = {
  dojang: DojangLandingContent | null;
  landingSaved: boolean;
  templatesCount: number;
  pendingTrialsCount: number;
  loading: boolean;
};

const INITIAL_STATUS: DashboardStatus = {
  dojang: null,
  landingSaved: false,
  templatesCount: 0,
  pendingTrialsCount: 0,
  loading: true,
};

const DashboardStatusContext = createContext<DashboardStatus | null>(null);

export function DashboardStatusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<DashboardStatus>(INITIAL_STATUS);

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      fetchMyDojang(),
      fetchMyTemplates(),
      fetchTrialRequests(),
    ]).then(([dojangResult, templatesResult, trialsResult]) => {
      if (cancelled) {
        return;
      }
      const dojang =
        dojangResult.status === "fulfilled" ? dojangResult.value : null;
      const templatesCount =
        templatesResult.status === "fulfilled"
          ? templatesResult.value.length
          : 0;
      const pendingTrialsCount =
        trialsResult.status === "fulfilled"
          ? trialsResult.value.filter((item) => item.status === "PENDING")
              .length
          : 0;

      setStatus({
        dojang,
        landingSaved: dojang?.updatedAt != null,
        templatesCount,
        pendingTrialsCount,
        loading: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <DashboardStatusContext.Provider value={status}>
      {children}
    </DashboardStatusContext.Provider>
  );
}

export function useDashboardStatus(): DashboardStatus {
  const context = useContext(DashboardStatusContext);
  if (!context) {
    throw new Error(
      "useDashboardStatus는 DashboardStatusProvider 안에서만 사용할 수 있습니다.",
    );
  }
  return context;
}
