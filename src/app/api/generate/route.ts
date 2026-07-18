import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { GenerateError, mapOpenAiError } from "@/lib/generate-errors";
import { generateFromForm } from "@/lib/generate-from-form";
import { generateSiteWithOpenAI } from "@/lib/generate-site-ai";
import type { GenerateResult } from "@/lib/site-types";
import { NextResponse } from "next/server";

function slugEmail(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "business";
  return `hello@${slug}.com`;
}

/**
 * Parse business info from request body.
 * Supports structured form fields and legacy { prompt }.
 */
function parseBusinessInput(
  body: Record<string, unknown>,
): BusinessFormInput | null {
  if (typeof body.prompt === "string" && body.prompt.trim()) {
    const prompt = body.prompt.trim();
    const nameMatch = prompt.match(/Business name:\s*(.+)/i);
    const locationMatch = prompt.match(/Location:\s*(.+)/i);
    const servicesMatch = prompt.match(/Services:\s*(.+)/i);
    const phoneMatch = prompt.match(/Phone:\s*(.+)/i);
    const emailMatch = prompt.match(/Email:\s*(.+)/i);

    const businessName =
      nameMatch?.[1]?.trim().split("\n")[0] ||
      prompt.split(/[—–\n]/)[0]?.trim() ||
      "Your Business";
    const location =
      locationMatch?.[1]?.trim().split("\n")[0] || "Local area";
    const services =
      servicesMatch?.[1]?.trim().split("\n")[0] ||
      "General services, free estimates";
    const phone =
      phoneMatch?.[1]?.trim().split("\n")[0] || "(555) 000-0000";
    const email =
      emailMatch?.[1]?.trim().split("\n")[0] || slugEmail(businessName);

    return { businessName, location, services, phone, email };
  }

  const businessName =
    typeof body.businessName === "string" ? body.businessName.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const services =
    typeof body.services === "string" ? body.services.trim() : "";

  if (!businessName || !location || !services) return null;

  return {
    businessName,
    location,
    services,
    phone:
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : "(555) 000-0000",
    email:
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : slugEmail(businessName),
  };
}

/**
 * POST /api/generate
 *
 * Business info → OpenAI API → Structured JSON → Website
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
      throw new GenerateError(
        "VALIDATION_ERROR",
        "Invalid JSON body",
        400,
      );
    }

    const input = parseBusinessInput(body);
    if (!input) {
      throw new GenerateError(
        "VALIDATION_ERROR",
        "Business name, location, and services are required",
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

    // Primary path: OpenAI structured JSON → website
    try {
      const site = await generateSiteWithOpenAI(input);
      const result: GenerateResult = { site, source: "ai" };
      return NextResponse.json(result);
    } catch (openaiError) {
      console.error("OpenAI generation failed:", openaiError);
      const mapped = mapOpenAiError(openaiError);

      // Hard failures (auth / quota) — don't silently fall back
      if (
        mapped.code === "INVALID_API_KEY" ||
        mapped.code === "QUOTA_EXCEEDED"
      ) {
        throw mapped;
      }

      // Soft failure — still return a full website from structured template
      console.warn("Falling back to template generator");
      const result: GenerateResult = {
        site: generateFromForm(input),
        source: "mock",
      };
      return NextResponse.json(result);
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
