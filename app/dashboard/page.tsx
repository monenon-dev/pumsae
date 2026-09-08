import Link from "next/link";
import { getOwnerDojang } from "@/lib/dojang/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const dojang = await getOwnerDojang();
  const displayName = profile?.name ?? user?.email ?? "관장님";
  const roleLabel = profile?.role === "INSTRUCTOR" ? "강사" : "관장";

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
      <p className="mt-2 text-sm text-zinc-600">
        안녕하세요, {displayName}님 ({roleLabel})
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/landing"
          className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
        >
          <p className="text-sm font-medium text-zinc-500">홍보</p>
          <h2 className="mt-1 text-lg font-semibold">랜딩페이지 만들기</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            이름, 소개, 사진만 입력하면 공개 홍보 페이지가 생성됩니다.
          </p>
        </Link>
        {dojang ? (
          <Link
            href={`/${dojang.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-300"
          >
            <p className="text-sm font-medium text-zinc-500">공개 주소</p>
            <h2 className="mt-1 text-lg font-semibold">/{dojang.slug}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              학부모에게 공유할 체육관 페이지입니다.
            </p>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
