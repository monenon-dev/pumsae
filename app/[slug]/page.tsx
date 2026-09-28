import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return <DojangLanding content={dojang} />;
}
