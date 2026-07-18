import type { BusinessFormInput } from "./business-form";
import type { GeneratedSite } from "./site-types";
import { getSupabaseAdmin } from "./supabase";

export type ProjectRow = {
  id: string;
  user_email: string;
  business_name: string;
  input: BusinessFormInput;
  site: GeneratedSite;
  created_at: string;
  updated_at: string;
};

export type ProjectSummary = {
  id: string;
  businessName: string;
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
    .select("id, business_name, created_at, updated_at")
    .eq("user_email", userEmail.toLowerCase())
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to list projects:", error.message);
    throw new Error("PROJECT_LIST_FAILED");
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    businessName: row.business_name as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
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
