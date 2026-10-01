const APP_FEATURES = [
  {
    title: "체험 신청 알림",
    description: "학부모가 신청하면 앱을 꺼 둬도 휴대폰으로 알림이 와요. 누르면 바로 승인·거절할 수 있어요.",
  },
  {
    title: "수업 중에 사진 올리기",
    description: "카메라로 찍거나 여러 장을 골라 사진첩에 올려요. 공개로 정한 앨범만 홈페이지에 보여요.",
  },
  {
    title: "일정·카드뉴스 확인",
    description: "도장 일정을 달력으로 관리하고, 웹에서 만든 카드뉴스를 갤러리에 바로 저장해요.",
  },
];

/** 홈 화면 "휴대폰 앱과 연결돼요": 관장·사범용 Flutter 앱 소개. */
export function MobileAppSection() {
  return (
    <section className="border-t border-pumsae-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_320px]">
        <div>
          <span className="inline-flex rounded-full border border-pumsae-line bg-white px-3 py-1 text-xs font-medium text-pumsae-muted">
            Android 앱 · Google Play 출시 준비 중
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            휴대폰 앱과 연결돼요
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-pumsae-muted">
            웹에서 쓰는 계정 그대로 PUMSAE 앱에 로그인하면, 도장 밖에서도 신청과 사진을 바로
            챙길 수 있어요. 홈페이지 편집처럼 넓은 화면이 필요한 일은 웹에서, 급한 확인은 앱에서.
          </p>
          <ul className="mt-8 space-y-5">
            {APP_FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-pumsae-accent"
                  aria-hidden
                />
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-pumsae-muted">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 앱이 실제로 띄우는 알림과 같은 문구로 그린 모형 */}
        <div
          className="mx-auto w-full max-w-[320px] rounded-[2.5rem] border border-pumsae-line bg-white p-3 shadow-sm"
          aria-label="체험 신청 알림이 온 휴대폰 화면 예시"
          role="img"
        >
          <div className="rounded-[2rem] bg-pumsae-ink px-4 pb-10 pt-6">
            <p className="text-center text-4xl font-light tracking-tight text-white">2:24</p>
            <p className="mt-1 text-center text-xs text-white/60">10월 1일 목요일</p>
            <div className="mt-8 rounded-2xl bg-white/95 p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-bold text-pumsae-accent ring-1 ring-pumsae-line">
                  P
                </span>
                <span className="text-xs text-pumsae-muted">PUMSAE · 지금</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-pumsae-ink">새 체험 신청</p>
              <p className="text-sm text-pumsae-ink">홍길동 학생 · 유아부</p>
            </div>
            <div className="mt-2 rounded-2xl bg-white/70 p-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs font-bold text-pumsae-accent ring-1 ring-pumsae-line">
                  P
                </span>
                <span className="text-xs text-pumsae-muted">PUMSAE · 1시간 전</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-pumsae-ink">새 체험 신청</p>
              <p className="text-sm text-pumsae-ink">김하늘 학생 · 초등부</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
