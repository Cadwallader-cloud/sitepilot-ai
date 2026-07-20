import { redirect } from "next/navigation";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

/** Legacy Stripe success URL → /upgrade/success */
export default async function PublishSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;
  if (session_id) {
    redirect(`/upgrade/success?session_id=${encodeURIComponent(session_id)}`);
  }
  redirect("/upgrade");
}
