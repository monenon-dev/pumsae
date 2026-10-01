import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 아래 색은 CSS 변수(app/globals.css)를 거쳐서, 다크 모드에서 한꺼번에 바뀐다.
        // 도장 공개 페이지·카드뉴스처럼 관장님이 고른 디자인은 .theme-light 안에서 늘 밝은 값을 쓴다.
        white: "rgb(var(--c-white) / <alpha-value>)",
        zinc: {
          50: "rgb(var(--c-zinc-50) / <alpha-value>)",
          100: "rgb(var(--c-zinc-100) / <alpha-value>)",
          200: "rgb(var(--c-zinc-200) / <alpha-value>)",
          300: "rgb(var(--c-zinc-300) / <alpha-value>)",
          400: "rgb(var(--c-zinc-400) / <alpha-value>)",
          500: "rgb(var(--c-zinc-500) / <alpha-value>)",
          600: "rgb(var(--c-zinc-600) / <alpha-value>)",
          700: "rgb(var(--c-zinc-700) / <alpha-value>)",
          800: "rgb(var(--c-zinc-800) / <alpha-value>)",
          900: "rgb(var(--c-zinc-900) / <alpha-value>)",
          950: "rgb(var(--c-zinc-950) / <alpha-value>)",
        },
        red: { 50: "rgb(var(--c-red-50) / <alpha-value>)", 600: "rgb(var(--c-red-600) / <alpha-value>)", 700: "rgb(var(--c-red-700) / <alpha-value>)" },
        emerald: {
          50: "rgb(var(--c-emerald-50) / <alpha-value>)",
          100: "rgb(var(--c-emerald-100) / <alpha-value>)",
          200: "rgb(var(--c-emerald-200) / <alpha-value>)",
          700: "rgb(var(--c-emerald-700) / <alpha-value>)",
          800: "rgb(var(--c-emerald-800) / <alpha-value>)",
          900: "rgb(var(--c-emerald-900) / <alpha-value>)",
        },
        amber: { 50: "rgb(var(--c-amber-50) / <alpha-value>)", 800: "rgb(var(--c-amber-800) / <alpha-value>)" },
        pumsae: {
          bg: "rgb(var(--c-pumsae-bg) / <alpha-value>)",
          ink: "rgb(var(--c-pumsae-ink) / <alpha-value>)",
          accent: "#B4222E",
          "accent-dark": "#8F1B24",
          line: "rgb(var(--c-pumsae-line) / <alpha-value>)",
          muted: "rgb(var(--c-pumsae-muted) / <alpha-value>)",
        },
        // 빨간 버튼·사진 위 글자처럼 다크 모드에서도 늘 흰색이어야 하는 곳.
        "pure-white": "#FFFFFF",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
