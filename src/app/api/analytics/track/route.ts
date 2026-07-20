import {
  insertAnalyticsEvent,
  isAnalyticsEventType,
  resolveProjectId,
} from "@/lib/site-analytics";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: {
    projectId?: unknown;
    slug?: unknown;
    eventType?: unknown;
    path?: unknown;
    visitorId?: unknown;
    referrer?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isAnalyticsEventType(body.eventType)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const projectId = await resolveProjectId({
    projectId: typeof body.projectId === "string" ? body.projectId : null,
    slug: typeof body.slug === "string" ? body.slug : null,
  });

  if (!projectId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const ok = await insertAnalyticsEvent({
    projectId,
    eventType: body.eventType,
    path: typeof body.path === "string" ? body.path : null,
    visitorId: typeof body.visitorId === "string" ? body.visitorId : null,
    referrer:
      typeof body.referrer === "string"
        ? body.referrer
        : request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
  });

  if (!ok) {
    return NextResponse.json({ error: "Track failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
