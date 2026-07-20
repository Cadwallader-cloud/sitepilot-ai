import { redirect } from "next/navigation";

type PublishPageProps = {
  searchParams: Promise<{ business?: string; project?: string }>;
};

/** Legacy /publish → upgrade plans */
export default async function PublishPage({ searchParams }: PublishPageProps) {
  const { business, project } = await searchParams;
  const params = new URLSearchParams();
  if (project) params.set("project", project);
  if (business) params.set("business", business);
  const qs = params.toString();
  redirect(`/upgrade${qs ? `?${qs}` : ""}`);
}
