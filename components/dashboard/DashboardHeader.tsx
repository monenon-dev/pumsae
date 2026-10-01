"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { PumsaeLogo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { useDashboardStatus } from "@/components/dashboard/DashboardStatusProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { href: "/dashboard", label: "내 작업물" },
  { href: "/dashboard/landing", label: "랜딩페이지" },
  { href: "/dashboard/templates", label: "카드뉴스" },
  { href: "/dashboard/albums", label: "사진첩" },
  { href: "/dashboard/calendar", label: "캘린더" },
  { href: "/dashboard/trials", label: "체험 신청" },
];

function isActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { loading, landingSaved, pendingTrialsCount } = useDashboardStatus();
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 항목을 누르면 그 onClick에서 닫는다. pathname이 바뀔 때 닫으면, 느린
  // 휴대폰에서 이동이 끝나기 전에 ☰를 다시 눌러 연 메뉴가 이동 완료와 함께
  // 저절로 닫혀 버린다. 뒤로/앞으로 가기만 따로 닫는다.
  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function handlePopState() {
      setMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [menuOpen]);

  function badgesFor(href: string) {
    return (
      <>
        {href === "/dashboard/landing" && !loading && !landingSaved ? (
          <Badge variant="accent">미완성</Badge>
        ) : null}
        {href === "/dashboard/trials" && !loading && pendingTrialsCount > 0 ? (
          <Badge variant="accent">{pendingTrialsCount}</Badge>
        ) : null}
      </>
    );
  }

  // 햄버거 버튼에도 알림 점을 달아, 메뉴를 닫아 둔 상태에서도 새 소식이 보이게 한다.
  const hasAlert = !loading && (!landingSaved || pendingTrialsCount > 0);

  return (
    <header className="sticky top-0 z-30 border-b border-pumsae-line bg-pumsae-bg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="shrink-0">
            <PumsaeLogo />
          </Link>
          {/* 넓은 화면: 한 줄 메뉴 */}
          <nav className="hidden gap-1 text-sm lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 ${
                  isActive(link.href, pathname)
                    ? "bg-pumsae-ink text-white"
                    : "text-pumsae-muted hover:bg-pumsae-line"
                }`}
              >
                {link.label}
                {badgesFor(link.href)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ProfileMenu />
          {/* 좁은 화면: 햄버거 버튼 */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="dashboard-mobile-menu"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-pumsae-ink hover:bg-pumsae-line lg:hidden"
          >
            <MenuIcon open={menuOpen} />
            {hasAlert && !menuOpen ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pumsae-accent" />
            ) : null}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <div
            aria-hidden
            className="fixed inset-x-0 bottom-0 top-16 z-10 bg-black/20 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="dashboard-mobile-menu"
            className="absolute inset-x-0 top-full z-20 border-b border-pumsae-line bg-pumsae-bg px-4 pb-4 pt-2 shadow-lg lg:hidden"
          >
            <ul className="mx-auto max-w-7xl space-y-1">
              {links.map((link) => {
                const active = isActive(link.href, pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-3 text-base ${
                        active
                          ? "bg-pumsae-ink font-semibold text-white"
                          : "text-pumsae-ink hover:bg-pumsae-line"
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="flex items-center gap-1">{badgesFor(link.href)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
