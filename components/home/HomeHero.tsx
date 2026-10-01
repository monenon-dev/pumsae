/* eslint-disable @next/next/no-img-element -- 움직이는 WebP와 정지 이미지를 <picture>로 고르기 위해 img를 쓴다. */
import Link from "next/link";

/** 캐릭터 둘레에 떠 있는 알림 카드. PUMSAE가 해 주는 일을 한 줄씩 보여 준다. */
const CHIPS = [
  { icon: "🔔", title: "새 체험 신청", body: "김하준 · 초등부", className: "left-0 top-6 sm:-left-4", delay: "0s" },
  { icon: "🏆", title: "카드뉴스 완성", body: "전국대회 금상 소식", className: "right-0 top-1/3 sm:-right-6", delay: "-1.3s" },
  { icon: "📷", title: "사진 업로드", body: "여름 승급 심사", className: "bottom-8 left-2 sm:-left-8", delay: "-2.6s" },
];

/** 홈 맨 위: 왼쪽은 소개와 시작 버튼, 오른쪽은 날아차기 캐릭터와 기능 알림 카드. */
export function HomeHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-white to-pumsae-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="text-center lg:text-left">
          <span className="inline-flex rounded-full border border-pumsae-line bg-white px-3 py-1 text-xs font-medium text-pumsae-muted">
            태권도장 홍보 · 수강생 관리
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            체육관 홍보와
            <br />
            수강생 관리, 한 곳에서
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-pumsae-muted sm:text-lg lg:mx-0">
            관장님이 텍스트와 사진만 입력하면 홍보 페이지가 만들어지고, 체험 신청까지 실시간으로
            받을 수 있어요.
          </p>
          <div className="mt-8">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center rounded-lg bg-pumsae-accent px-6 py-3 text-sm font-semibold text-white hover:bg-pumsae-accent-dark"
            >
              {isLoggedIn ? "대시보드로 가기" : "로그인하고 시작하기"}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[460px]">
          {/* 앱 로딩 캐릭터와 같은 브랜드 빨강 원. 흰 캐릭터가 흰 바탕에 묻히지 않게 깐다. */}
          <div className="absolute inset-[8%] rounded-full bg-pumsae-accent/10" aria-hidden />
          <picture>
            <source srcSet="/images/hero/flying-kick-still.webp" media="(prefers-reduced-motion: reduce)" />
            <img
              src="/images/hero/flying-kick.webp"
              alt="날아차기를 하는 태권도 캐릭터"
              width={297}
              height={360}
              className="absolute bottom-[10%] left-1/2 h-[78%] w-auto -translate-x-1/2"
            />
          </picture>
          {CHIPS.map((chip) => (
            <div
              key={chip.title}
              className={`hero-chip-float absolute flex items-center gap-2.5 rounded-xl border border-pumsae-line bg-white/95 px-3 py-2 shadow-md ${chip.className}`}
              style={{ animationDelay: chip.delay }}
            >
              <span className="text-lg" aria-hidden>
                {chip.icon}
              </span>
              <div className="text-left">
                <p className="text-xs font-semibold">{chip.title}</p>
                <p className="text-[11px] text-pumsae-muted">{chip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
