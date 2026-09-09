"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  changeMyPassword,
  fetchMyProfile,
  updateMyProfile,
  updateMyRole,
  type DashboardProfile,
} from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/types";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1";

const readonlyClassName =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-base text-zinc-600";

const ROLE_LABELS = {
  OWNER: "관장",
  INSTRUCTOR: "사범",
} as const;

const ROLE_OPTIONS = ["OWNER", "INSTRUCTOR"] as const;

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMyProfile()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setProfile(data);
        setName(data.name);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "계정 정보를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function applyProfile(next: DashboardProfile) {
    setProfile(next);
    setName(next.name);
    updateUser({ name: next.name, email: next.email, role: next.role });
  }

  async function handleNameSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("이름을 입력해 주세요.");
      setNameSuccess(null);
      return;
    }

    setNameSaving(true);
    setNameError(null);
    setNameSuccess(null);
    try {
      const next = await updateMyProfile(trimmed);
      applyProfile(next);
      setNameSuccess("이름을 저장했습니다.");
    } catch (error: unknown) {
      setNameError(
        error instanceof ApiError
          ? error.message
          : "이름을 저장하지 못했습니다.",
      );
    } finally {
      setNameSaving(false);
    }
  }

  async function handleRoleSelect(role: "OWNER" | "INSTRUCTOR") {
    if (!profile || profile.role === role || roleSaving) {
      return;
    }

    setRoleSaving(true);
    setRoleError(null);
    try {
      const next = await updateMyRole(role);
      applyProfile(next);
    } catch (error: unknown) {
      setRoleError(
        error instanceof ApiError ? error.message : "역할을 바꾸지 못했습니다.",
      );
    } finally {
      setRoleSaving(false);
    }
  }

  async function handlePasswordSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setConfirmError("새 비밀번호가 서로 다릅니다.");
      setPasswordError(null);
      setPasswordSuccess(null);
      return;
    }

    setPasswordSaving(true);
    setConfirmError(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const result = await changeMyPassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setName(profile?.name ?? "");
      setNameError(null);
      setNameSuccess(null);
      setPasswordSuccess(result.success || "비밀번호가 변경됐어요.");
    } catch (error: unknown) {
      setPasswordError(
        error instanceof ApiError
          ? error.message
          : "비밀번호를 바꾸지 못했습니다.",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">계정 정보를 불러오는 중...</p>;
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">프로필</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {loadError ?? "계정 정보를 불러오지 못했습니다."}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">프로필</h1>
        <p className="mt-2 text-sm text-zinc-600">
          로그인한 계정 이름과 비밀번호를 관리합니다. 도장 소개는 랜딩페이지에서
          바꿔 주세요.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-zinc-500">계정</p>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-sm font-medium">이메일</dt>
            <dd>
              <input
                type="email"
                value={profile.email}
                readOnly
                disabled
                className={readonlyClassName}
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium">소속 도장</dt>
            <dd>
              <input
                type="text"
                value={profile.dojangName ?? "소속 도장이 없습니다"}
                readOnly
                disabled
                className={readonlyClassName}
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium">역할</dt>
            <dd className="mt-2 flex gap-2">
              {ROLE_OPTIONS.map((role) => {
                const selected = profile.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={roleSaving}
                    onClick={() => void handleRoleSelect(role)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
                      selected
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                );
              })}
            </dd>
            {roleError ? (
              <p className="mt-2 text-sm text-red-700">{roleError}</p>
            ) : null}
          </div>
        </dl>
      </div>

      <form
        onSubmit={(event) => void handleNameSave(event)}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight">이름</h2>
          <p className="mt-1 text-sm text-zinc-600">
            대시보드에 표시되는 이름입니다.
          </p>
        </div>
        <label className="block text-sm font-medium">
          이름
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(null);
              setNameSuccess(null);
            }}
            className={inputClassName}
          />
        </label>
        {nameError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {nameError}
          </p>
        ) : null}
        {nameSuccess ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {nameSuccess}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={nameSaving || name.trim() === profile.name}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {nameSaving ? "저장 중..." : "이름 저장"}
        </button>
      </form>

      <form
        onSubmit={(event) => void handlePasswordSave(event)}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight">비밀번호</h2>
          <p className="mt-1 text-sm text-zinc-600">
            현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿉니다.
          </p>
        </div>
        <label className="block text-sm font-medium">
          현재 비밀번호
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            className={inputClassName}
          />
        </label>
        <label className="block text-sm font-medium">
          새 비밀번호
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            minLength={6}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setConfirmError(null);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            className={inputClassName}
          />
        </label>
        <label className="block text-sm font-medium">
          새 비밀번호 확인
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setConfirmError(null);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            className={inputClassName}
          />
          {confirmError ? (
            <p className="mt-1 text-sm text-red-700">{confirmError}</p>
          ) : null}
        </label>
        {passwordError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {passwordError}
          </p>
        ) : null}
        {passwordSuccess ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {passwordSuccess}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={passwordSaving}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {passwordSaving ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </section>
  );
}
