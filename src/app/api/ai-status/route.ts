import { getModelRoutingSnapshot } from "@/lib/ai-engine/model-router";
import { getOpenAIClient } from "@/lib/generate-site-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim());
  const client = getOpenAIClient();
  const routing = getModelRoutingSnapshot();

  return NextResponse.json({
    configured,
    /** @deprecated use routing.quality / routing.fast */
    model: routing.legacy || routing.quality,
    ready: configured && Boolean(client),
    routing: {
      enabled: routing.routingEnabled,
      fast: routing.fast,
      quality: routing.quality,
      stages: routing.stages,
    },
  });
}
