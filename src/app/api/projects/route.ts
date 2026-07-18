import { auth } from "@/auth";
import { listProjects } from "@/lib/projects";
import { NextResponse } from "next/server";

/** GET /api/projects — list current user's saved projects */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await listProjects(email);
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 },
    );
  }
}
