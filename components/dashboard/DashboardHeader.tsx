"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const links = [
  { href: "/dashboard", label: "홈" },
  { href: "/dashboard/landing", label: "랜딩페이지" },
  { href: "/dashboard/templates", label: "카드뉴스" },
  { href: "/dashboard/trials", label: "체험 신청" },
];

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <p className="shrink-0 text-sm font-semibold tracking-wide text-zinc-500">
            PUMSAE
          </p>
          <nav className="flex gap-1 overflow-x-auto text-sm">
            {links.map((link) => {
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {link.label}
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
