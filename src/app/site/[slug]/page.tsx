import { PublishedWebsite } from "@/components/published-website";
import { getPublishedSiteBySlug } from "@/lib/publish";
import { siteSeoToMetadata } from "@/lib/seo-metadata";
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
  return siteSeoToMetadata(published.site);
}

export default async function PublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  const published = await getPublishedSiteBySlug(slug);
  if (!published) notFound();

  return (
    <PublishedWebsite
      site={published.site}
      projectId={published.id}
      slug={published.slug}
    />
  );
}
