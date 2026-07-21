import { getPublishedSiteBySlug } from "@/lib/publish";
import { getSupabaseAdmin } from "@/lib/supabase";

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "contact_click",
  "phone_click",
  "maps_click",
  "form_submission",
  "lead",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

/** Click events rolled up into the Clicks metric. */
export const ANALYTICS_CLICK_EVENT_TYPES = [
  "contact_click",
  "phone_click",
  "maps_click",
] as const;

export type AnalyticsClickEventType =
  (typeof ANALYTICS_CLICK_EVENT_TYPES)[number];

/** Dashboard metrics (Task 8). */
export const ANALYTICS_METRICS = [
  "Visitors",
  "Leads",
  "Form submissions",
  "Clicks",
] as const;

export type AnalyticsSummary = {
  visitors: number;
  leads: number;
  formSubmissions: number;
  clicks: number;
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
    leads: 0,
    formSubmissions: 0,
    clicks: 0,
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
  let leads = 0;
  let formSubmissions = 0;
  let clicks = 0;

  for (const row of data ?? []) {
    const type = row.event_type as string;
    if (type === "page_view") {
      if (typeof row.visitor_id === "string" && row.visitor_id) {
        visitorIds.add(row.visitor_id);
      }
    } else if (type === "lead") {
      leads += 1;
    } else if (type === "form_submission") {
      formSubmissions += 1;
    } else if (
      (ANALYTICS_CLICK_EVENT_TYPES as readonly string[]).includes(type)
    ) {
      clicks += 1;
    }
  }

  return {
    visitors: visitorIds.size,
    leads,
    formSubmissions,
    clicks,
  };
}
