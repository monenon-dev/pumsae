import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DojangLanding } from "@/components/landing/DojangLanding";
import { getDojangBySlug } from "@/lib/dojang/queries";

type PublicLandingPageProps = {
  params: { slug: string };
};

export async function generateMetadata({
  params,
}: PublicLandingPageProps): Promise<Metadata> {
  const dojang = await getDojangBySlug(params.slug);

  if (!dojang) {
    return { title: "체육관을 찾을 수 없습니다" };
  }

  return {
    title: `${dojang.name} | PUMSAE`,
    description: dojang.description ?? `${dojang.name} 홍보 페이지`,
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
