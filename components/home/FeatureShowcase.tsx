"use client";

import type { ReactNode } from "react";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { PromoCard } from "@/components/templates/PromoCard";
import { ScaledFrame } from "@/components/ui/ScaledFrame";
import { PROMO_CARD_SIZE } from "@/types/promo-template";
import { EXAMPLE_CARDS, EXAMPLE_DOJANG, EXAMPLE_LAYOUTS } from "./example-data";

/** 체험 신청 관리 카드에 들어가는 예시 신청 목록(지어낸 이름). */
const EXAMPLE_TRIALS = [
  { name: "김하준", detail: "초등부 · 오늘 14:02", status: "대기" },
  { name: "이서윤", detail: "유아부 · 오늘 11:40", status: "대기" },
  { name: "박도윤", detail: "초등부 · 어제", status: "승인" },
];

function LandingDesigns() {
  return (
    <div className="grid h-full grid-cols-2 gap-2 p-3">
      {EXAMPLE_LAYOUTS.map((layout) => (
        <div key={layout} className="overflow-hidden rounded-md border border-pumsae-line bg-white">
          <ScaledFrame baseWidth={1280} aspectRatio="16 / 10">
            <DojangLanding content={{ ...EXAMPLE_DOJANG, heroLayout: layout }} preview />
          </ScaledFrame>
        </div>
      ))}
    </div>
  );
}

function CardRow() {
  // 세 장을 나란히 놓고 살짝씩 기울여, 서로 가리지 않으면서 손으로 늘어놓은 느낌을 낸다.
  const tilts = ["-rotate-3", "rotate-0 -translate-y-2", "rotate-3"];
  return (
    <div className="flex h-full items-center justify-center gap-2 px-3">
      {EXAMPLE_CARDS.map((card, index) => (
        <div
          key={card.type}
          className={`w-[31%] overflow-hidden rounded-md shadow-md ${tilts[index]}`}
        >
          <ScaledFrame baseWidth={PROMO_CARD_SIZE} aspectRatio="1 / 1">
            <PromoCard content={card} />
          </ScaledFrame>
        </div>
      ))}
    </div>
  );
}

function TrialList() {
  return (
    <ul className="flex h-full flex-col justify-center gap-2 p-4">
      {EXAMPLE_TRIALS.map((trial) => (
        <li
          key={trial.name}
          className="flex items-center justify-between rounded-lg border border-pumsae-line bg-white px-3 py-2.5 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold">{trial.name}</p>
            <p className="text-xs text-pumsae-muted">{trial.detail}</p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              trial.status === "대기"
                ? "bg-pumsae-accent/10 text-pumsae-accent"
                : "bg-zinc-100 text-pumsae-muted"
            }`}
          >
            {trial.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

const FEATURES: { title: string; description: string; picture: ReactNode }[] = [
  {
    title: "랜딩페이지 빌더",
    description: "이름과 사진만 넣고 12가지 디자인 중 하나를 고르면 홍보 페이지가 완성돼요.",
    picture: <LandingDesigns />,
  },
  {
    title: "카드뉴스 생성기",
    description: "대회 수상, 띠 승급, 신규 모집 소식을 인스타용 카드로 바로 만들어요.",
    picture: <CardRow />,
  },
  {
    title: "체험 신청 관리",
    description: "홍보 페이지로 들어온 학부모 신청을 실시간으로 받고 바로 확인해요.",
    picture: <TrialList />,
  },
];

/** 홈 "이렇게 만들어져요": 기능마다 실제 결과물 예시 그림과 한 줄 요약. */
export function FeatureShowcase() {
  return (
    <section className="border-t border-pumsae-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">이렇게 만들어져요</h2>
          <p className="mt-2 text-sm text-pumsae-muted">
            아래 그림은 모두 &quot;예시 태권도장&quot;으로 만들어 본 실제 화면이에요.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="overflow-hidden rounded-2xl border border-pumsae-line bg-pumsae-bg"
            >
              <div className="aspect-[4/3] border-b border-pumsae-line">{feature.picture}</div>
              <div className="bg-white p-6">
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-pumsae-muted">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
