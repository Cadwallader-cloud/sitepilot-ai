import { PublishedWebsite } from "@/components/published-website";
import { getPublishedSiteBySlug } from "@/lib/publish";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const published = await getPublishedSiteBySlug(slug);
  if (!published) {
    return { title: "Site not found" };
  }
  return {
    title: published.site.seo.title,
    description: published.site.seo.description,
    keywords: published.site.seo.keywords,
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  const published = await getPublishedSiteBySlug(slug);
  if (!published) notFound();

  return <PublishedWebsite site={published.site} />;
}
