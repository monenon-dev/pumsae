"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { PumsaeLogo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { useDashboardStatus } from "@/components/dashboard/DashboardStatusProvider";

const links = [
  { href: "/dashboard", label: "홈" },
  { href: "/dashboard/landing", label: "랜딩페이지" },
  { href: "/dashboard/templates", label: "카드뉴스" },
  { href: "/dashboard/trials", label: "체험 신청" },
  { href: "/dashboard/profile", label: "프로필" },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { loading, landingSaved, pendingTrialsCount } = useDashboardStatus();

  return (
    <header className="sticky top-0 z-20 border-b border-pumsae-line bg-pumsae-bg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="shrink-0">
            <PumsaeLogo />
          </Link>
          <nav className="flex gap-1 overflow-x-auto text-sm">
            {links.map((link) => {
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);

              const showIncompleteBadge =
                link.href === "/dashboard/landing" && !loading && !landingSaved;
              const showPendingBadge =
                link.href === "/dashboard/trials" &&
                !loading &&
                pendingTrialsCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 ${
                    active
                      ? "bg-pumsae-ink text-white"
                      : "text-pumsae-muted hover:bg-pumsae-line"
                  }`}
                >
                  {link.label}
                  {showIncompleteBadge ? (
                    <Badge variant="accent">미완성</Badge>
                  ) : null}
                  {showPendingBadge ? (
                    <Badge variant="accent">{pendingTrialsCount}</Badge>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
