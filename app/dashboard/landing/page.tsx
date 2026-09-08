import { LandingEditor } from "@/components/landing/LandingEditor";
import { getOwnerDojang } from "@/lib/dojang/queries";

export default async function LandingDashboardPage() {
  const dojang = await getOwnerDojang();

  if (!dojang) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">랜딩페이지</h1>
        <p className="mt-2 text-sm text-zinc-600">
          소속 체육관을 찾지 못했습니다. 다시 로그인한 뒤 시도해 주세요.
        </p>
      </section>
    );
  }

  return <LandingEditor initial={dojang} />;
}
