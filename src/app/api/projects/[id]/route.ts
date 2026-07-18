import { auth } from "@/auth";
import { getProject, updateProjectSite } from "@/lib/projects";
import type { GeneratedSite } from "@/lib/site-types";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/projects/[id] — load one project owned by the signed-in user */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const project = await getProject(id, email);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      project: {
        id: project.id,
        businessName: project.business_name,
        input: project.input,
        site: project.site,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 },
    );
  }
}

/** PATCH /api/projects/[id] — persist edited site JSON */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { site?: GeneratedSite };
  try {
    body = (await request.json()) as { site?: GeneratedSite };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.site || typeof body.site !== "object") {
    return NextResponse.json({ error: "site is required" }, { status: 400 });
  }

  try {
    const project = await updateProjectSite({
      id,
      userEmail: email,
      site: body.site,
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: project.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}
