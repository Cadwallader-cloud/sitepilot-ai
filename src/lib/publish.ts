import type { BusinessFormInput } from "./business-form";
import type { GeneratedSite } from "./site-types";
import { isReservedSlug, publicSiteUrl, toSlug, withSlugSuffix } from "./slug";
import { getSupabaseAdmin } from "./supabase";
import { normalizeCustomDomain } from "./tenancy";
import {
  ensureWebsite,
  stampWebsiteMetadata,
  websiteToGeneratedSite,
} from "./website";

export type PublishedProject = {
  id: string;
  slug: string;
  ownerId: string;
  customDomain: string | null;
  published: boolean;
  site: GeneratedSite;
  publishedAt: string | null;
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

function toPublished(row: {
  id: string;
  slug: string;
  site: GeneratedSite;
  owner_id?: string | null;
  user_email?: string | null;
  custom_domain?: string | null;
  published?: boolean | null;
  published_at?: string | null;
}): PublishedProject {
  const slug = row.slug;
  return {
    id: row.id,
    slug,
    ownerId: (row.owner_id || row.user_email || "").toLowerCase(),
    customDomain: row.custom_domain ?? null,
    published: Boolean(row.published ?? row.published_at),
    site: websiteToGeneratedSite(row.site as never),
    publishedAt: row.published_at ?? null,
    url: publicSiteUrl(slug),
  };
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
  let customDomain: string | null = null;

  if (projectId) {
    const { data: existing, error } = await supabase
      .from("projects")
      .select("id, slug, user_email, custom_domain")
      .eq("id", projectId)
      .eq("user_email", email)
      .maybeSingle();

    if (error) throw new Error("PROJECT_LOOKUP_FAILED");
    if (!existing) throw new Error("PROJECT_NOT_FOUND");
    slug = (existing.slug as string | null) ?? null;
    customDomain = (existing.custom_domain as string | null) ?? null;
  }

  if (!slug) {
    slug = await allocateUniqueSlug(businessName, projectId ?? undefined);
  }
  slug = slug.toLowerCase();

  const website = stampWebsiteMetadata(
    ensureWebsite(params.site, params.input?.location ?? "", {
      projectId: projectId ?? undefined,
    }),
    {
      projectId: projectId ?? undefined,
      status: "published",
    },
  );

  const publishFields = {
    site: website,
    business_name: businessName,
    slug,
    owner_id: email,
    published: true,
    published_at: now,
    updated_at: now,
    ...(params.input ? { input: params.input } : {}),
  };

  if (projectId) {
    const { data, error } = await supabase
      .from("projects")
      .update(publishFields)
      .eq("id", projectId)
      .eq("user_email", email)
      .select(
        "id, slug, site, owner_id, user_email, custom_domain, published, published_at",
      )
      .single();

    if (error || !data) {
      // Fallback if multitenant columns not migrated yet
      const legacy = await supabase
        .from("projects")
        .update({
          site: website,
          business_name: businessName,
          slug,
          published_at: now,
          updated_at: now,
          ...(params.input ? { input: params.input } : {}),
        })
        .eq("id", projectId)
        .eq("user_email", email)
        .select("id, slug, site, user_email, published_at")
        .single();

      if (legacy.error || !legacy.data) {
        console.error("Publish update failed:", error?.message, legacy.error?.message);
        throw new Error("PUBLISH_FAILED");
      }

      return toPublished({
        ...(legacy.data as {
          id: string;
          slug: string;
          site: GeneratedSite;
          user_email: string;
          published_at: string;
        }),
        custom_domain: customDomain,
        published: true,
      });
    }

    return toPublished(
      data as {
        id: string;
        slug: string;
        site: GeneratedSite;
        owner_id: string;
        user_email: string;
        custom_domain: string | null;
        published: boolean;
        published_at: string;
      },
    );
  }

  const input: BusinessFormInput = params.input ?? {
    businessName,
    category: "Local Business",
    location: params.site.contact.address || "",
    description: params.site.about?.text?.slice(0, 200) || "",
    services: params.site.services.map((s) => s.title).join(", "),
    phone: params.site.contact.phone || "",
    email: params.site.contact.email || "",
  };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_email: email,
      owner_id: email,
      business_name: businessName,
      input,
      site: website,
      slug,
      published: true,
      published_at: now,
    })
    .select(
      "id, slug, site, owner_id, user_email, custom_domain, published, published_at",
    )
    .single();

  if (error || !data) {
    const legacy = await supabase
      .from("projects")
      .insert({
        user_email: email,
        business_name: businessName,
        input,
        site: website,
        slug,
        published_at: now,
      })
      .select("id, slug, site, user_email, published_at")
      .single();

    if (legacy.error || !legacy.data) {
      console.error("Publish insert failed:", error?.message, legacy.error?.message);
      throw new Error("PUBLISH_FAILED");
    }

    const legacyRow = legacy.data as {
      id: string;
      slug: string;
      site: GeneratedSite;
      user_email: string;
      published_at: string;
    };
    const stamped = stampWebsiteMetadata(ensureWebsite(legacyRow.site as never), {
      projectId: legacyRow.id,
      status: "published",
    });
    await supabase
      .from("projects")
      .update({ site: stamped })
      .eq("id", legacyRow.id);

    return toPublished({
      ...legacyRow,
      site: websiteToGeneratedSite(stamped) as never,
      published: true,
    });
  }

  const row = data as {
    id: string;
    slug: string;
    site: GeneratedSite;
    owner_id: string;
    user_email: string;
    custom_domain: string | null;
    published: boolean;
    published_at: string;
  };
  const stamped = stampWebsiteMetadata(ensureWebsite(row.site as never), {
    projectId: row.id,
    status: "published",
  });
  await supabase.from("projects").update({ site: stamped }).eq("id", row.id);

  return toPublished({
    ...row,
    site: websiteToGeneratedSite(stamped) as never,
  });
}

async function fetchPublishedRow(
  column: "slug" | "custom_domain",
  value: string,
): Promise<PublishedProject | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const normalized =
    column === "custom_domain"
      ? normalizeCustomDomain(value)
      : value.toLowerCase();

  // Prefer published=true; also accept www/non-www for custom domains
  const select =
    "id, slug, site, owner_id, user_email, custom_domain, published, published_at";

  if (column === "slug") {
    const { data, error } = await supabase
      .from("projects")
      .select(select)
      .eq("slug", normalized)
      .eq("published", true)
      .maybeSingle();

    if (!error && data?.slug) {
      return toPublished(data as Parameters<typeof toPublished>[0]);
    }

    // Legacy: published_at only
    const legacy = await supabase
      .from("projects")
      .select(select)
      .eq("slug", normalized)
      .not("published_at", "is", null)
      .maybeSingle();

    if (legacy.error) {
      console.error("getPublishedSiteBySlug:", legacy.error.message);
      return null;
    }
    if (!legacy.data?.slug) return null;
    return toPublished(legacy.data as Parameters<typeof toPublished>[0]);
  }

  // custom_domain — try exact, then www., then apex
  const candidates = [
    normalized,
    `www.${normalized}`,
    normalizeCustomDomain(normalized),
  ];
  const unique = [...new Set(candidates)];

  for (const domain of unique) {
    const { data, error } = await supabase
      .from("projects")
      .select(select)
      .eq("custom_domain", domain)
      .eq("published", true)
      .maybeSingle();

    if (!error && data?.slug) {
      return toPublished(data as Parameters<typeof toPublished>[0]);
    }
  }

  // Legacy without published flag
  for (const domain of unique) {
    const { data, error } = await supabase
      .from("projects")
      .select(select)
      .eq("custom_domain", domain)
      .not("published_at", "is", null)
      .maybeSingle();

    if (!error && data?.slug) {
      return toPublished(data as Parameters<typeof toPublished>[0]);
    }
    if (error && error.code !== "PGRST116" && !error.message.includes("custom_domain")) {
      console.error("getPublishedSiteByDomain:", error.message);
    }
  }

  return null;
}

/** Public lookup by crestis slug — only published sites */
export async function getPublishedSiteBySlug(
  slug: string,
): Promise<PublishedProject | null> {
  return fetchPublishedRow("slug", slug);
}

/** Public lookup by custom domain — only published sites */
export async function getPublishedSiteByDomain(
  domain: string,
): Promise<PublishedProject | null> {
  return fetchPublishedRow("custom_domain", domain);
}

/** Set or clear a project's custom domain (owner only). */
export async function setProjectCustomDomain(params: {
  projectId: string;
  ownerEmail: string;
  customDomain: string | null;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const domain = params.customDomain
    ? normalizeCustomDomain(params.customDomain)
    : null;

  const { error } = await supabase
    .from("projects")
    .update({
      custom_domain: domain,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.projectId)
    .eq("user_email", params.ownerEmail.toLowerCase());

  if (error) {
    console.error("setProjectCustomDomain:", error.message);
    return false;
  }
  return true;
}
