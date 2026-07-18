import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { GenerateError, mapOpenAiError } from "@/lib/generate-errors";
import { generateSiteWithOpenAI } from "@/lib/generate-site-ai";
import type { GenerateResult } from "@/lib/site-types";
import { NextResponse } from "next/server";

function parseBusinessInput(
  body: Record<string, unknown>,
): BusinessFormInput | null {
  const businessName =
    typeof body.businessName === "string" ? body.businessName.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const services =
    typeof body.services === "string" ? body.services.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!businessName || !location || !services || !phone || !email) {
    return null;
  }

  return { businessName, location, services, phone, email };
}

/**
 * POST /api/generate
 *
 * Receives businessName, location, services, phone, email
 * → OpenAI → STRICT website JSON (+ design assets for renderer)
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new GenerateError(
        "UNAUTHORIZED",
        "Sign in with Google to generate your website",
        401,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      throw new GenerateError("VALIDATION_ERROR", "Invalid JSON body", 400);
    }

    const input = parseBusinessInput(body);
    if (!input) {
      throw new GenerateError(
        "VALIDATION_ERROR",
        "businessName, location, services, phone, and email are required",
        400,
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      throw new GenerateError(
        "MISSING_API_KEY",
        "OpenAI API key not configured",
        503,
      );
    }

    try {
      const site = await generateSiteWithOpenAI(input);
      const result: GenerateResult = { site, source: "ai" };
      return NextResponse.json(result);
    } catch (openaiError) {
      console.error("OpenAI generation failed:", openaiError);
      throw mapOpenAiError(openaiError);
    }
  } catch (error) {
    if (error instanceof GenerateError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate site", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
