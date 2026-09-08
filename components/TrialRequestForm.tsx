"use client";

import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api/types";
import { createTrialRequest } from "@/lib/api/trials";
import {
  DESIRED_CLASSES,
  DESIRED_CLASS_LABELS,
  type DesiredClass,
} from "@/types/trial-request";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

type TrialRequestFormProps = {
  dojangId: string;
  disabled?: boolean;
};

export function TrialRequestForm({
  dojangId,
  disabled = false,
}: TrialRequestFormProps) {
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [desiredClass, setDesiredClass] = useState<DesiredClass | "">("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await createTrialRequest({
        dojangId,
        studentName: studentName.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        desiredClass: desiredClass || null,
        memo: memo.trim() || null,
      });
      setDone(true);
      setStudentName("");
      setParentName("");
      setParentPhone("");
      setDesiredClass("");
      setMemo("");
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : "신청을 보내지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-6 text-left text-zinc-900 shadow-sm sm:p-8">
        <p className="text-lg font-semibold">신청이 접수되었습니다</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          관장님이 확인한 뒤 연락드립니다. 입력하신 번호로 안내가 갈 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 text-sm font-medium text-zinc-900 underline"
        >
          다른 신청 쓰기
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-2xl bg-white p-6 text-left text-zinc-900 shadow-sm sm:p-8"
    >
      <p className="text-lg font-semibold">체험 수업 신청</p>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        학생과 보호자 정보를 남겨 주시면 수업 일정을 안내해 드립니다.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          학생 이름
          <input
            name="studentName"
            required
            autoComplete="name"
            disabled={disabled}
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            className={inputClassName}
            placeholder="홍길동"
          />
        </label>
        <label className="block text-sm font-medium">
          보호자 이름
          <input
            name="parentName"
            required
            autoComplete="name"
            disabled={disabled}
            value={parentName}
            onChange={(event) => setParentName(event.target.value)}
            className={inputClassName}
            placeholder="홍부모"
          />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          연락처
          <input
            name="parentPhone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            disabled={disabled}
            value={parentPhone}
            onChange={(event) => setParentPhone(event.target.value)}
            className={inputClassName}
            placeholder="010-1234-5678"
          />
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          희망 반
          <select
            name="desiredClass"
            disabled={disabled}
            value={desiredClass}
            onChange={(event) =>
              setDesiredClass(event.target.value as DesiredClass | "")
            }
            className={inputClassName}
          >
            <option value="">아직 잘 모르겠어요</option>
            {DESIRED_CLASSES.map((value) => (
              <option key={value} value={value}>
                {DESIRED_CLASS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          메모
          <textarea
            name="memo"
            rows={3}
            disabled={disabled}
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            className={inputClassName}
            placeholder="희망 요일, 체험 인원 등"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled || submitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60 sm:w-auto"
        style={{ backgroundColor: "var(--landing-brand, #18181b)" }}
      >
        {submitting ? "보내는 중..." : "체험 신청하기"}
      </button>
    </form>
  );
}
