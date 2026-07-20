import { getPublishedSiteBySlug } from "@/lib/publish";
import { getSupabaseAdmin } from "@/lib/supabase";

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "contact_click",
  "phone_click",
  "maps_click",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export type AnalyticsSummary = {
  visitors: number;
  pageViews: number;
  contactClicks: number;
  phoneClicks: number;
  mapsClicks: number;
};

export function isAnalyticsEventType(
  value: unknown,
): value is AnalyticsEventType {
  return (
    typeof value === "string" &&
    (ANALYTICS_EVENT_TYPES as readonly string[]).includes(value)
  );
}

export async function resolveProjectId(params: {
  projectId?: string | null;
  slug?: string | null;
}): Promise<string | null> {
  if (params.projectId?.trim()) return params.projectId.trim();
  if (params.slug?.trim()) {
    const published = await getPublishedSiteBySlug(params.slug.trim());
    return published?.id ?? null;
  }
  return null;
}

export async function insertAnalyticsEvent(params: {
  projectId: string;
  eventType: AnalyticsEventType;
  path?: string | null;
  visitorId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("analytics_events").insert({
    project_id: params.projectId,
    event_type: params.eventType,
    path: params.path?.slice(0, 500) || null,
    visitor_id: params.visitorId?.slice(0, 80) || null,
    referrer: params.referrer?.slice(0, 500) || null,
    user_agent: params.userAgent?.slice(0, 400) || null,
  });

  if (error) {
    console.error("insertAnalyticsEvent:", error.message);
    return false;
  }
  return true;
}

export async function getAnalyticsSummary(
  projectId: string,
): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    visitors: 0,
    pageViews: 0,
    contactClicks: 0,
    phoneClicks: 0,
    mapsClicks: 0,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) return empty;

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type, visitor_id")
    .eq("project_id", projectId);

  if (error) {
    console.error("getAnalyticsSummary:", error.message);
    return empty;
  }

  const visitorIds = new Set<string>();
  let pageViews = 0;
  let contactClicks = 0;
  let phoneClicks = 0;
  let mapsClicks = 0;

  for (const row of data ?? []) {
    const type = row.event_type as string;
    if (type === "page_view") {
      pageViews += 1;
      if (typeof row.visitor_id === "string" && row.visitor_id) {
        visitorIds.add(row.visitor_id);
      }
    } else if (type === "contact_click") contactClicks += 1;
    else if (type === "phone_click") phoneClicks += 1;
    else if (type === "maps_click") mapsClicks += 1;
  }

  return {
    visitors: visitorIds.size,
    pageViews,
    contactClicks,
    phoneClicks,
    mapsClicks,
  };
}
