import { ConstructionShowcase } from "@/components/showcase/construction-showcase";
import { ElectricianShowcase } from "@/components/showcase/electrician-showcase";
import { LandscapingShowcase } from "@/components/showcase/landscaping-showcase";
import { PlumbingShowcase } from "@/components/showcase/plumbing-showcase";
import { RoofingShowcase } from "@/components/showcase/roofing-showcase";
import { getShowcaseDemo, showcaseDemos } from "@/lib/showcase-demos";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const components = {
  roofing: RoofingShowcase,
  construction: ConstructionShowcase,
  landscaping: LandscapingShowcase,
  electrician: ElectricianShowcase,
  plumbing: PlumbingShowcase,
} as const;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return showcaseDemos.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  const demo = getShowcaseDemo(slug);
  if (!demo) notFound();

  const Component = components[slug as keyof typeof components];
  if (!Component) notFound();

  return <Component />;
}
