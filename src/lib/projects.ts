import type { BusinessFormInput } from "./business-form";
import { publicSiteUrl } from "./slug";
import type { GeneratedSite } from "./site-types";
import { getSupabaseAdmin } from "./supabase";
import {
  ensureWebsite,
  stampWebsiteMetadata,
  websiteToGeneratedSite,
} from "./website";
import { runJsonValidatorGate } from "./website-validator";

export type ProjectRow = {
  id: string;
  user_email: string;
  owner_id: string | null;
  business_name: string;
  input: BusinessFormInput;
  /** Canonical Website JSON from Supabase (never HTML) — v2 or legacy flat */
  site: GeneratedSite;
  slug: string | null;
  custom_domain: string | null;
  published: boolean | null;
  published_at: string | null;
  plan: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus = "published" | "draft";

export type ProjectSummary = {
  id: string;
  businessName: string;
  status: ProjectStatus;
  slug: string | null;
  customDomain: string | null;
  url: string | null;
  plan: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function saveProject(params: {
  userEmail: string;
  input: BusinessFormInput;
  site: GeneratedSite;
}): Promise<ProjectRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const email = params.userEmail.toLowerCase();
  // Persist Website Schema v2 only — never HTML
  // AI Output → JSON Validator → PASS (Save) | FAIL (Retry)
  const gated = runJsonValidatorGate(
    ensureWebsite(params.site, params.input.location, { status: "draft" }),
    { maxRetries: 1 },
  );
  const website = gated.website;
  const base = {
    user_email: email,
    business_name: website.business.name || params.input.businessName,
    input: params.input,
    site: website,
  };

  const withTenant = await supabase
    .from("projects")
    .insert({ ...base, owner_id: email, published: false })
    .select("*")
    .single();

  if (!withTenant.error && withTenant.data) {
    const row = withTenant.data as ProjectRow;
    const stamped = stampWebsiteMetadata(
      ensureWebsite(row.site as never),
      { projectId: row.id, status: "draft" },
    );
    await supabase
      .from("projects")
      .update({ site: stamped, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    return { ...row, site: websiteToGeneratedSite(stamped) };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(base)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Failed to save project:",
      withTenant.error?.message,
      error.message,
    );
    throw new Error("PROJECT_SAVE_FAILED");
  }

  const row = data as ProjectRow;
  const stamped = stampWebsiteMetadata(ensureWebsite(row.site as never), {
    projectId: row.id,
    status: "draft",
  });
  await supabase
    .from("projects")
    .update({ site: stamped, updated_at: new Date().toISOString() })
    .eq("id", row.id);
  return { ...row, site: websiteToGeneratedSite(stamped) };
}

export async function updateProjectSite(params: {
  id: string;
  userEmail: string;
  site: GeneratedSite;
}): Promise<ProjectRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const website = stampWebsiteMetadata(
    runJsonValidatorGate(
      ensureWebsite(params.site, "", {
        projectId: params.id,
        bumpVersion: true,
      }),
      { maxRetries: 1 },
    ).website,
    { projectId: params.id },
  );
  const { data, error } = await supabase
    .from("projects")
    .update({
      site: website,
      business_name: website.business.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("user_email", params.userEmail.toLowerCase())
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update project:", error.message);
    throw new Error("PROJECT_UPDATE_FAILED");
  }

  const row = data as ProjectRow;
  return { ...row, site: websiteToGeneratedSite(row.site as never) };
}

export async function listProjects(
  userEmail: string,
): Promise<ProjectSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const selects = [
    "id, business_name, slug, custom_domain, published, published_at, plan, created_at, updated_at",
    "id, business_name, slug, published, published_at, plan, created_at, updated_at",
    "id, business_name, slug, published_at, plan, created_at, updated_at",
    "id, business_name, slug, published_at, created_at, updated_at",
  ];

  let data: Record<string, unknown>[] | null = null;
  let lastError: string | null = null;

  for (const select of selects) {
    const result = await supabase
      .from("projects")
      .select(select)
      .eq("user_email", userEmail.toLowerCase())
      .order("updated_at", { ascending: false });

    if (!result.error) {
      data = (result.data as unknown as Record<string, unknown>[]) ?? [];
      break;
    }
    lastError = result.error.message;
  }

  if (!data) {
    console.error("Failed to list projects:", lastError);
    throw new Error("PROJECT_LIST_FAILED");
  }

  return data.map((row) => {
    const slug = (row.slug as string | null) ?? null;
    const publishedAt = (row.published_at as string | null) ?? null;
    const publishedFlag = row.published as boolean | null | undefined;
    const isPublished =
      publishedFlag === true ||
      (publishedFlag == null && Boolean(publishedAt));
    const status: ProjectStatus = isPublished ? "published" : "draft";
    return {
      id: row.id as string,
      businessName: row.business_name as string,
      status,
      slug,
      customDomain: (row.custom_domain as string | null) ?? null,
      url: status === "published" && slug ? publicSiteUrl(slug) : null,
      plan: (row.plan as string | null) ?? null,
      publishedAt,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getProject(
  id: string,
  userEmail: string,
): Promise<ProjectRow | null> {
  if (!UUID_RE.test(id)) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_email", userEmail.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Failed to get project:", error.message);
    throw new Error("PROJECT_GET_FAILED");
  }

  if (!data) return null;
  const row = data as ProjectRow;
  return {
    ...row,
    site: websiteToGeneratedSite(row.site as never),
  };
}

export async function deleteProject(
  id: string,
  userEmail: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_email", userEmail.toLowerCase());

  if (error) {
    console.error("Failed to delete project:", error.message);
    throw new Error("PROJECT_DELETE_FAILED");
  }

  return (count ?? 0) > 0;
}
