import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-zinc-900">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-zinc-500">
          PUMSAE
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          주소가 바뀌었거나, 아직 공개되지 않은 체육관일 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
