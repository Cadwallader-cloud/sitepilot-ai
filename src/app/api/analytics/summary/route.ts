import { auth } from "@/auth";
import { assertCanUseAnalytics } from "@/lib/billing";
import { getProject } from "@/lib/projects";
import { getAnalyticsSummary } from "@/lib/site-analytics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const denied = await assertCanUseAnalytics(email);
  if (denied) return denied;

  const projectId = request.nextUrl.searchParams.get("project")?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "project required" }, { status: 400 });
  }

  const project = await getProject(projectId, email);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const summary = await getAnalyticsSummary(projectId);
  return NextResponse.json({ ok: true, summary });
}
