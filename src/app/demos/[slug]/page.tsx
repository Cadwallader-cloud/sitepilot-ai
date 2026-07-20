import { TemplateShowcase } from "@/components/showcase/template-showcase";
import {
  getShowcaseDemo,
  getShowcaseDemoSite,
  showcaseDemos,
} from "@/lib/showcase-demos";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return showcaseDemos.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const demo = getShowcaseDemo(slug);
  if (!demo) return { title: "Demo not found" };

  return {
    title: `${demo.name} — Crestis Demo`,
    description: demo.tagline,
  };
}

export default async function ShowcaseDemoPage({ params }: PageProps) {
  const { slug } = await params;
  const demo = getShowcaseDemoSite(slug);
  if (!demo) notFound();

  return <TemplateShowcase demo={demo} />;
}
