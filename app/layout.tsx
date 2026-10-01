import type { Metadata } from "next";
import localFont from "next/font/local";
import { Do_Hyeon, Jua, Stylish } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

function siteUrl(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return new URL(fromEnv);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Optional headline fonts a dojang owner can pick per landing page.
//
// Song Myung, Black Han Sans, Gowun Batang, Gaegu, Nanum Myeongjo, and
// Sunflower are loaded via the <link> tag below instead of next/font/google:
// next/font/google (as bundled with next@14.2.35) fetches an incomplete
// Google Fonts CSS response for these specific families — the resulting
// @font-face rules cover Latin/CJK-punctuation ranges but not a single
// Hangul syllable, so any Korean text silently fell back to the default
// font. Confirmed via document.fonts.check("...", "가") returning false for
// each of these, both before and after a full cache-cleared rebuild (so it
// isn't a caching fluke). Do Hyeon, Jua, and Stylish load correctly through
// next/font/google and are unaffected.
const doHyeon = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-do-hyeon",
  display: "swap",
});
const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
  display: "swap",
});
const stylish = Stylish({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-stylish",
  display: "swap",
});

const LINKED_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Song+Myung&family=Black+Han+Sans&family=Gowun+Batang:wght@400;700&family=Gaegu:wght@300;400;700&family=Nanum+Myeongjo:wght@400;700&family=Sunflower:wght@300;700&display=swap";

// 첫 화면을 그리기 전에 다크/라이트를 정해서 깜빡임을 막는다. 저장한 선택이 있으면 그걸,
// 없으면 기기 설정을 따른다. 도장 공개 페이지(/{slug})는 늘 밝게 보여서 건드리지 않는다.
const THEME_INIT_SCRIPT = `(function(){try{
var seg=location.pathname.split('/')[1]||'';
var app=['','login','register','dashboard','profile','privacy'];
if(app.indexOf(seg)<0)return;
var t=localStorage.getItem('pumsae-theme');
var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
if(d)document.documentElement.classList.add('dark');
}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "PUMSAE",
  description: "지역 태권도장 홍보와 체험 신청을 위한 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 첫 화면 스크립트가 class="dark"를 붙이므로 서버 HTML과 달라도 경고하지 않게 한다.
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={LINKED_GOOGLE_FONTS_HREF} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${doHyeon.variable} ${jua.variable} ${stylish.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
