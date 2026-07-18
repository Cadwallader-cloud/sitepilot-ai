import type { BusinessFormInput } from "./business-form";
import type { GeneratedSite } from "./site-types";
import { isReservedSlug, publicSiteUrl, toSlug, withSlugSuffix } from "./slug";
import { getSupabaseAdmin } from "./supabase";

export type PublishedProject = {
  id: string;
  slug: string;
  site: GeneratedSite;
  publishedAt: string;
  url: string;
};

async function slugTaken(
  slug: string,
  exceptProjectId?: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return true;

  let query = supabase.from("projects").select("id").eq("slug", slug).limit(1);
  if (exceptProjectId) {
    query = query.neq("id", exceptProjectId);
  }
  const { data, error } = await query.maybeSingle();
  if (error && error.code !== "PGRST116") {
    console.error("slugTaken error:", error.message);
  }
  return Boolean(data?.id);
}

export async function allocateUniqueSlug(
  businessName: string,
  exceptProjectId?: string,
): Promise<string> {
  let base = toSlug(businessName);
  if (isReservedSlug(base)) {
    base = withSlugSuffix(base, "site");
  }

  if (!(await slugTaken(base, exceptProjectId))) return base;

  for (let i = 0; i < 12; i++) {
    const candidate = withSlugSuffix(
      base,
      Math.random().toString(36).slice(2, 8),
    );
    if (!(await slugTaken(candidate, exceptProjectId))) return candidate;
  }

  return withSlugSuffix(base, Date.now().toString(36));
}

/** Publish or republish a project. Keeps existing slug on republish. */
export async function publishProject(params: {
  userEmail: string;
  site: GeneratedSite;
  input?: BusinessFormInput | null;
  projectId?: string | null;
}): Promise<PublishedProject> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const email = params.userEmail.toLowerCase();
  const businessName =
    params.site.businessName || params.input?.businessName || "Site";
  const now = new Date().toISOString();

  let projectId = params.projectId ?? null;
  let slug: string | null = null;

  if (projectId) {
    const { data: existing, error } = await supabase
      .from("projects")
      .select("id, slug, user_email")
      .eq("id", projectId)
      .eq("user_email", email)
      .maybeSingle();

    if (error) throw new Error("PROJECT_LOOKUP_FAILED");
    if (!existing) throw new Error("PROJECT_NOT_FOUND");
    slug = (existing.slug as string | null) ?? null;
  }

  if (!slug) {
    slug = await allocateUniqueSlug(businessName, projectId ?? undefined);
  }
  slug = slug.toLowerCase();

  if (projectId) {
    const { data, error } = await supabase
      .from("projects")
      .update({
        site: params.site,
        business_name: businessName,
        slug,
        published_at: now,
        updated_at: now,
        ...(params.input ? { input: params.input } : {}),
      })
      .eq("id", projectId)
      .eq("user_email", email)
      .select("id, slug, site, published_at")
      .single();

    if (error || !data) {
      console.error("Publish update failed:", error?.message);
      throw new Error("PUBLISH_FAILED");
    }

    return {
      id: data.id as string,
      slug: data.slug as string,
      site: data.site as GeneratedSite,
      publishedAt: data.published_at as string,
      url: publicSiteUrl(data.slug as string),
    };
  }

  const input: BusinessFormInput = params.input ?? {
    businessName,
    location: params.site.contact.address || "",
    services: params.site.services.map((s) => s.title).join(", "),
    phone: params.site.contact.phone || "",
    email: params.site.contact.email || "",
  };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_email: email,
      business_name: businessName,
      input,
      site: params.site,
      slug,
      published_at: now,
    })
    .select("id, slug, site, published_at")
    .single();

  if (error || !data) {
    console.error("Publish insert failed:", error?.message);
    throw new Error("PUBLISH_FAILED");
  }

  return {
    id: data.id as string,
    slug: data.slug as string,
    site: data.site as GeneratedSite,
    publishedAt: data.published_at as string,
    url: publicSiteUrl(data.slug as string),
  };
}

/** Public lookup — only returns published sites */
export async function getPublishedSiteBySlug(
  slug: string,
): Promise<PublishedProject | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, site, published_at")
    .eq("slug", slug.toLowerCase())
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) {
    console.error("getPublishedSiteBySlug:", error.message);
    return null;
  }
  if (!data?.slug || !data.published_at) return null;

  return {
    id: data.id as string,
    slug: data.slug as string,
    site: data.site as GeneratedSite,
    publishedAt: data.published_at as string,
    url: publicSiteUrl(data.slug as string),
  };
}
