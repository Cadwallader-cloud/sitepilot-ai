import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { generateFromForm } from "@/lib/generate-from-form";
import { formInputToPrompt } from "@/lib/form-to-prompt";
import { generateSiteWithOpenAI } from "@/lib/generate-site-ai";
import type { GenerateResult } from "@/lib/site-types";
import { NextResponse } from "next/server";

function isBusinessInput(body: unknown): body is BusinessFormInput {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.businessName === "string" &&
    typeof b.location === "string" &&
    typeof b.services === "string" &&
    typeof b.phone === "string" &&
    typeof b.email === "string"
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Sign in with Google to generate your website",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!isBusinessInput(body)) {
      return NextResponse.json(
        {
          error:
            "businessName, location, services, phone, and email are required",
        },
        { status: 400 },
      );
    }

    const input: BusinessFormInput = {
      businessName: body.businessName.trim(),
      location: body.location.trim(),
      services: body.services.trim(),
      phone: body.phone.trim(),
      email: body.email.trim(),
    };

    if (
      !input.businessName ||
      !input.location ||
      !input.services ||
      !input.phone ||
      !input.email
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          code: "MISSING_API_KEY",
        },
        { status: 503 },
      );
    }

    const prompt = formInputToPrompt(input);
    let result: GenerateResult;

    try {
      const site = await generateSiteWithOpenAI(prompt, input);
      result = { site, source: "ai" };
    } catch (error) {
      console.error("OpenAI generation failed:", error);
      const message =
        error instanceof Error ? error.message : "OpenAI request failed";

      if (message.includes("401") || message.includes("Incorrect API key")) {
        return NextResponse.json(
          {
            error: "Invalid OpenAI API key",
            code: "INVALID_API_KEY",
          },
          { status: 401 },
        );
      }

      if (message.includes("429") || message.includes("quota")) {
        return NextResponse.json(
          {
            error: "OpenAI quota exceeded",
            code: "QUOTA_EXCEEDED",
          },
          { status: 429 },
        );
      }

      // Structured fallback — still a full website, not empty placeholders
      result = { site: generateFromForm(input), source: "mock" };
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
