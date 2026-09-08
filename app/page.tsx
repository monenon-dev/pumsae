import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-zinc-500">
          PUMSAE
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          우리 체육관 홍보를 시작해 보세요
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          랜딩페이지, 홍보 카드, 체험 신청을 한곳에서 관리합니다.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            체육관 새로 등록
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
