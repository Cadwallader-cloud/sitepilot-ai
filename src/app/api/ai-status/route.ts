import { getOpenAIClient } from "@/lib/generate-site-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim());
  const client = getOpenAIClient();

  return NextResponse.json({
    configured,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    ready: configured && Boolean(client),
  });
}
