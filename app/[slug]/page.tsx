import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { getDojangBySlug } from "@/lib/dojang/queries";
import { dojangSeo } from "@/lib/dojang/seo";

export const dynamic = "force-dynamic";

type PublicLandingPageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: PublicLandingPageProps): Promise<Metadata> {
  const dojang = await getDojangBySlug(params.slug);

  if (!dojang) {
    return {
      title: "체육관을 찾을 수 없습니다",
      description: "공개 주소가 없거나, 아직 랜딩페이지가 준비되지 않았습니다.",
    };
  }

  const { title, description } = dojangSeo(dojang);

  return {
    title,
    description,
    openGraph: {
      title: dojang.name,
      description,
      type: "website",
      locale: "ko_KR",
      siteName: "PUMSAE",
    },
    twitter: {
      card: "summary_large_image",
      title: dojang.name,
      description,
    },
  };
}

export default async function PublicLandingPage({
  params,
}: PublicLandingPageProps) {
  const dojang = await getDojangBySlug(params.slug);

  if (!dojang) {
    notFound();
  }

  // 관장님이 주소를 바꾼 뒤 예전 주소로 들어오면 새 주소로 영구 이동시킨다.
  if (dojang.slug !== decodeURIComponent(params.slug).toLowerCase()) {
    permanentRedirect(`/${dojang.slug}`);
  }

  return <DojangLanding content={dojang} />;
}
