import { PublishedWebsite } from "@/components/published-website";
import { getPublishedSiteByDomain } from "@/lib/publish";
import { siteSeoToMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ host: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { host } = await params;
  const domain = decodeURIComponent(host);
  const published = await getPublishedSiteByDomain(domain);
  if (!published) {
    return { title: "Site not found" };
  }
  return siteSeoToMetadata(published.site);
}

/** Custom-domain tenant entry — hostname matched to projects.custom_domain */
export default async function CustomDomainSitePage({ params }: PageProps) {
  const { host } = await params;
  const domain = decodeURIComponent(host);
  const published = await getPublishedSiteByDomain(domain);
  if (!published) notFound();

  return (
    <PublishedWebsite
      site={published.site}
      projectId={published.id}
      slug={published.slug}
    />
  );
}
