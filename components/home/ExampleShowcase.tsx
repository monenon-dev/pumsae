"use client";

import { useState } from "react";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { PromoCard } from "@/components/templates/PromoCard";
import { ScaledFrame } from "@/components/ui/ScaledFrame";
import { createPromoContent } from "@/lib/promo/layouts";
import {
  DEFAULT_HERO_IMAGE_POSITION,
  HERO_LAYOUT_LABELS,
  type DojangLandingContent,
  type HeroLayout,
} from "@/types/dojang";
import { PROMO_CARD_SIZE, type PromoTemplateType } from "@/types/promo-template";

// 실제 체육관이 아니라 설명용으로 지어낸 예시다(화면에도 "예시"로 표시).
const EXAMPLE_NAME = "예시 태권도장";
const EXAMPLE_SLUG = "example-taekwondo";

const EXAMPLE_DOJANG: DojangLandingContent = {
  id: "example",
  name: EXAMPLE_NAME,
  slug: EXAMPLE_SLUG,
  description: "기본기부터 품새·겨루기까지, 아이 눈높이에 맞춰 차근차근 가르칩니다.",
  logoUrl: null,
  heroImageUrl: null,
  heroImagePosition: DEFAULT_HERO_IMAGE_POSITION,
  logoPosition: null,
  brandColor: "#b91c1c",
  customBgColor: null,
  customTextColor: null,
  sectionSpacing: "NORMAL",
  sectionText: {},
  canvasElements: [],
  heroLayout: "GRADIENT",
  headingFont: "PRETENDARD",
  region: "서울 강남구",
  address: null,
  phone: "02-000-0000",
  updatedAt: null,
};

const EXAMPLE_LAYOUTS: HeroLayout[] = ["GRADIENT", "TRADITIONAL", "KIDS", "PREMIUM"];

const EXAMPLE_CARDS = (["AWARD", "BELT_UP", "RECRUIT", "EVENT"] as PromoTemplateType[]).map(
  (type) => createPromoContent(type, EXAMPLE_NAME),
);

const TABS = [
  {
    id: "landing",
    label: "랜딩페이지",
    steps: [
      { title: "체육관 이름과 소개 입력", body: "가입할 때 적은 이름이 바로 들어가요. 소개글 한두 줄이면 충분해요." },
      { title: "사진·디자인 고르기", body: "대표 사진과 로고를 올리고, 12가지 디자인 중 마음에 드는 걸 골라요." },
      { title: "주소를 학부모님께 공유", body: "저장하면 바로 공개돼요. 체험 신청도 이 페이지에서 받아요." },
    ],
  },
  {
    id: "cards",
    label: "카드뉴스",
    steps: [
      { title: "종류 고르기", body: "대회 수상, 띠 승급, 신규 모집, 행사 중에서 골라요." },
      { title: "내용만 바꾸기", body: "제목과 문구, 사진만 바꾸면 디자인은 자동으로 맞춰져요." },
      { title: "이미지 저장해서 올리기", body: "고화질 이미지로 내려받아 인스타그램·단톡방에 바로 올려요." },
    ],
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Steps({ steps }: { steps: readonly { title: string; body: string }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pumsae-accent text-sm font-bold text-white">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold">{step.title}</p>
            <p className="mt-0.5 text-sm leading-6 text-pumsae-muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-pumsae-line bg-white shadow-lg">
      <div className="flex items-center gap-2 border-b border-pumsae-line bg-zinc-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-zinc-500">
          pumsae.vercel.app/{EXAMPLE_SLUG}
        </span>
      </div>
      {children}
    </div>
  );
}

/** 홈 화면 "이렇게 만들어져요": 실제 화면 코드로 그린 예시 랜딩페이지·카드뉴스. */
export function ExampleShowcase() {
  const [tab, setTab] = useState<TabId>("landing");
  const [layout, setLayout] = useState<HeroLayout>("GRADIENT");
  const current = TABS.find((item) => item.id === tab) ?? TABS[0];

  return (
    <section className="border-t border-pumsae-line">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">이렇게 만들어져요</h2>
          <p className="mt-2 text-sm text-pumsae-muted">
            아래는 &quot;{EXAMPLE_NAME}&quot;로 만들어 본 예시예요.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-pumsae-line bg-white p-1 text-sm">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={`rounded-full px-4 py-1.5 font-medium ${
                  tab === item.id ? "bg-pumsae-ink text-white" : "text-pumsae-muted hover:text-pumsae-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Steps steps={current.steps} />

          {tab === "landing" ? (
            <div>
              <BrowserFrame>
                <ScaledFrame baseWidth={1280} aspectRatio="16 / 10">
                  <DojangLanding content={{ ...EXAMPLE_DOJANG, heroLayout: layout }} preview />
                </ScaledFrame>
              </BrowserFrame>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {EXAMPLE_LAYOUTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLayout(item)}
                    aria-pressed={layout === item}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      layout === item
                        ? "border-pumsae-ink bg-pumsae-ink text-white"
                        : "border-pumsae-line bg-white text-pumsae-muted hover:text-pumsae-ink"
                    }`}
                  >
                    {HERO_LAYOUT_LABELS[item]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-pumsae-muted">
                디자인을 눌러 바꿔 보세요. 12가지 중 4가지예요.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {EXAMPLE_CARDS.map((card) => (
                <li key={card.type} className="overflow-hidden rounded-xl shadow-md">
                  <ScaledFrame baseWidth={PROMO_CARD_SIZE} aspectRatio="1 / 1">
                    <PromoCard content={card} />
                  </ScaledFrame>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
