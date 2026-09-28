"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { Badge } from "@/components/ui/Badge";
import { ScaledFrame } from "@/components/ui/ScaledFrame";
import {
  fetchMyDojang,
  fetchMyTemplates,
  type PromoTemplateListItem,
} from "@/lib/api/dashboard";
import { fetchTrialRequests } from "@/lib/api/trials";
import type { DojangLandingContent } from "@/types/dojang";
import {
  DESIRED_CLASS_LABELS,
  TRIAL_STATUS_LABELS,
  type TrialRequest,
} from "@/types/trial-request";

const RECENT_TEMPLATES = 4;
const RECENT_TRIALS = 5;
const PREVIEW_WIDTH = 1280;

const cardClassName =
  "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6";

type WorksState = {
  loading: boolean;
  dojang: DojangLandingContent | null;
  templates: PromoTemplateListItem[];
  trials: TrialRequest[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ko-KR");
}

function SectionHeader({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 text-sm font-medium text-zinc-900 underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

// 실제 페이지를 PC 폭(1280px)으로 그린 뒤 카드 폭에 맞게 줄여 첫 화면을 보여준다.
function ScaledPreview({ content }: { content: DojangLandingContent }) {
  return (
    <ScaledFrame
      baseWidth={PREVIEW_WIDTH}
      aspectRatio="16 / 10"
      className="rounded-xl border border-zinc-200"
    >
      <DojangLanding content={content} preview />
    </ScaledFrame>
  );
}

function LandingCard({ dojang }: { dojang: DojangLandingContent | null }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!dojang) {
    return (
      <section className={cardClassName}>
        <SectionHeader
          title="내 홈페이지"
          description="체육관 정보를 불러오지 못했어요."
          href="/dashboard/landing"
          linkLabel="편집하기"
        />
      </section>
    );
  }

  const published = dojang.updatedAt != null;
  const publicPath = `/${dojang.slug}`;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("아래 주소를 복사해 주세요.", `${window.location.origin}${publicPath}`);
    }
  }

  return (
    <section className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">내 홈페이지</h2>
            {published ? null : <Badge variant="accent">미완성</Badge>}
          </div>
          <p className="mt-1 truncate text-sm text-zinc-600">
            {published
              ? "학부모님께 이 주소를 공유하세요."
              : "아직 저장하지 않았어요. 편집하고 저장하면 공개돼요."}
          </p>
        </div>
        <Link
          href="/dashboard/landing"
          className="shrink-0 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          편집하기
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2.5 text-sm">
        <span className="min-w-0 flex-1 truncate font-medium text-zinc-800">
          {origin.replace(/^https?:\/\//, "")}
          {publicPath}
        </span>
        <button
          type="button"
          onClick={() => void copyAddress()}
          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          {copied ? "복사됐어요" : "주소 복사"}
        </button>
        <Link
          href={publicPath}
          target="_blank"
          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          공개 페이지 보기
        </Link>
      </div>

      <Link
        href="/dashboard/landing"
        aria-label="홈페이지 편집하기"
        className="mt-4 block hover:opacity-95"
      >
        <ScaledPreview content={dojang} />
      </Link>
    </section>
  );
}

function TemplatesCard({ templates }: { templates: PromoTemplateListItem[] }) {
  const recent = templates.slice(0, RECENT_TEMPLATES);

  return (
    <section className={cardClassName}>
      <SectionHeader
        title="카드뉴스"
        description={`지금까지 ${templates.length}개 만들었어요.`}
        href="/dashboard/templates"
        linkLabel="전체 보기"
      />
      {recent.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-6 text-center">
          <p className="text-sm text-zinc-600">아직 만든 카드뉴스가 없어요.</p>
          <Link
            href="/dashboard/templates/new"
            className="mt-2 inline-block text-sm font-medium text-zinc-900 underline"
          >
            첫 카드뉴스 만들기
          </Link>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {recent.map((template) => (
            <li key={template.id}>
              <Link
                href={`/dashboard/templates/${template.id}`}
                className="block rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50"
              >
                {template.thumbnailUrl ? (
                  // Thumbnails are user uploads on any host, so native img is used on purpose.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={template.thumbnailUrl}
                    alt=""
                    className="mb-2 aspect-square w-full rounded-lg object-cover"
                  />
                ) : null}
                <p className="text-xs font-medium text-zinc-500">{template.typeLabel}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{template.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(template.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/dashboard/templates/new"
        className="mt-4 inline-flex text-sm font-medium text-zinc-900 underline"
      >
        새로 만들기
      </Link>
    </section>
  );
}

function TrialsCard({ trials }: { trials: TrialRequest[] }) {
  const pending = trials.filter((trial) => trial.status === "PENDING").length;
  const recent = [...trials]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, RECENT_TRIALS);

  return (
    <section className={cardClassName}>
      <SectionHeader
        title="체험 신청"
        description={
          pending > 0
            ? `확인하지 않은 신청이 ${pending}건 있어요.`
            : `지금까지 ${trials.length}건 받았어요.`
        }
        href="/dashboard/trials"
        linkLabel="전체 보기"
      />
      {recent.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600">
          아직 들어온 체험 신청이 없어요. 홈페이지 주소를 공유해 보세요.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100">
          {recent.map((trial) => (
            <li key={trial.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {trial.studentName}
                  {trial.desiredClass ? (
                    <span className="ml-1.5 text-xs font-normal text-zinc-500">
                      {DESIRED_CLASS_LABELS[trial.desiredClass]}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-zinc-500">{formatDate(trial.createdAt)}</p>
              </div>
              <Badge variant={trial.status === "PENDING" ? "accent" : "muted"}>
                {TRIAL_STATUS_LABELS[trial.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function MyWorksPage() {
  const [state, setState] = useState<WorksState>({
    loading: true,
    dojang: null,
    templates: [],
    trials: [],
  });

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      fetchMyDojang(),
      fetchMyTemplates(),
      fetchTrialRequests(),
    ]).then(([dojang, templates, trials]) => {
      if (cancelled) {
        return;
      }
      setState({
        loading: false,
        dojang: dojang.status === "fulfilled" ? dojang.value : null,
        templates: templates.status === "fulfilled" ? templates.value : [],
        trials: trials.status === "fulfilled" ? trials.value : [],
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">내 작업물</h1>
        <p className="mt-2 text-sm text-zinc-600">
          지금까지 만든 홈페이지와 카드뉴스, 들어온 체험 신청을 한눈에 확인하세요.
        </p>
      </div>

      {state.loading ? (
        <p className="text-sm text-zinc-500">불러오는 중...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <LandingCard dojang={state.dojang} />
          <div className="space-y-6">
            <TemplatesCard templates={state.templates} />
            <TrialsCard trials={state.trials} />
          </div>
        </div>
      )}
    </section>
  );
}
