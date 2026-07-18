import type { BusinessFormInput } from "./business-form";
import { publicSiteUrl } from "./slug";
import type { GeneratedSite } from "./site-types";
import { getSupabaseAdmin } from "./supabase";

export type ProjectRow = {
  id: string;
  user_email: string;
  business_name: string;
  input: BusinessFormInput;
  site: GeneratedSite;
  slug: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus = "published" | "draft";

export type ProjectSummary = {
  id: string;
  businessName: string;
  status: ProjectStatus;
  slug: string | null;
  url: string | null;
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

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_email: params.userEmail.toLowerCase(),
      business_name: params.site.businessName || params.input.businessName,
      input: params.input,
      site: params.site,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to save project:", error.message);
    throw new Error("PROJECT_SAVE_FAILED");
  }

  return data as ProjectRow;
}

export async function updateProjectSite(params: {
  id: string;
  userEmail: string;
  site: GeneratedSite;
}): Promise<ProjectRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("projects")
    .update({
      site: params.site,
      business_name: params.site.businessName,
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

  return data as ProjectRow;
}

export async function listProjects(
  userEmail: string,
): Promise<ProjectSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("id, business_name, slug, published_at, created_at, updated_at")
    .eq("user_email", userEmail.toLowerCase())
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to list projects:", error.message);
    throw new Error("PROJECT_LIST_FAILED");
  }

  return (data ?? []).map((row) => {
    const slug = (row.slug as string | null) ?? null;
    const publishedAt = (row.published_at as string | null) ?? null;
    const status: ProjectStatus = publishedAt ? "published" : "draft";
    return {
      id: row.id as string,
      businessName: row.business_name as string,
      status,
      slug,
      url: status === "published" && slug ? publicSiteUrl(slug) : null,
      publishedAt,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  });
}

export async function getProject(
  id: string,
  userEmail: string,
): Promise<ProjectRow | null> {
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

  return (data as ProjectRow) ?? null;
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
