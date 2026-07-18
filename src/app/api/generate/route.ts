import { auth } from "@/auth";
import { generateSiteWithOpenAI } from "@/lib/generate-site-ai";
import { generateSiteFromPrompt } from "@/lib/generate-site";
import type { GenerateResult } from "@/lib/site-types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in with Google to generate your website", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: "Prompt must be under 2000 characters" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local",
          code: "MISSING_API_KEY",
        },
        { status: 503 },
      );
    }

    let result: GenerateResult;

    try {
      const site = await generateSiteWithOpenAI(prompt);
      result = { site, source: "ai" };
    } catch (error) {
      console.error("OpenAI generation failed:", error);
      const message =
        error instanceof Error ? error.message : "OpenAI request failed";

      if (message.includes("401") || message.includes("Incorrect API key")) {
        return NextResponse.json(
          {
            error: "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local",
            code: "INVALID_API_KEY",
          },
          { status: 401 },
        );
      }

      if (message.includes("429") || message.includes("quota")) {
        return NextResponse.json(
          {
            error: "OpenAI quota exceeded. Add billing at platform.openai.com",
            code: "QUOTA_EXCEEDED",
          },
          { status: 429 },
        );
      }

      result = { site: generateSiteFromPrompt(prompt), source: "mock" };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate site" },
      { status: 500 },
    );
  }
}
