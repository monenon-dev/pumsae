"use client";

import { useEffect, useState } from "react";

/** 다크/라이트 선택을 기억하는 localStorage 키. app/layout.tsx의 첫 화면 스크립트와 같은 값. */
export const THEME_STORAGE_KEY = "pumsae-theme";

/** 헤더에 두는 다크/라이트 전환 버튼. 지금 밝으면 🌙, 어두우면 ☀️를 보여 준다. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // 서버에서는 지금 테마를 알 수 없어서, 화면에 붙은 뒤에 <html class>를 읽는다.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // 저장이 막힌 브라우저(사생활 보호 모드 등)에서는 이번 방문 동안만 바뀐다.
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "라이트 모드로 바꾸기" : "다크 모드로 바꾸기"}
      title={dark ? "라이트 모드" : "다크 모드"}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg leading-none hover:bg-pumsae-line ${className}`}
    >
      <span aria-hidden className={dark === null ? "invisible" : ""}>
        {dark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
