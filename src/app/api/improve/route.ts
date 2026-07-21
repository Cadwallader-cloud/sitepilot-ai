import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { GenerateError, mapOpenAiError } from "@/lib/generate-errors";
import {
  runImproveSite,
  type ImproveScope,
} from "@/lib/ai-engine/improve-site";
import type { GeneratedSite } from "@/lib/site-types";
import { websiteToGeneratedSite } from "@/lib/website";
import { NextResponse } from "next/server";

export const maxDuration = 120;

const IMPROVE_SCOPES = new Set<ImproveScope>([
  "hero",
  "services",
  "seo",
  "entire",
]);

function parseBusinessInput(
  body: Record<string, unknown>,
): BusinessFormInput | null {
  const businessName =
    typeof body.businessName === "string" ? body.businessName.trim() : "";
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const services =
    typeof body.services === "string" ? body.services.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (
    !businessName ||
    !category ||
    !location ||
    !description ||
    !services ||
    !phone ||
    !email
  ) {
    return null;
  }

  return {
    businessName,
    category,
    location,
    description,
    services,
    phone,
    email,
  };
}

function isGeneratedSite(value: unknown): value is GeneratedSite {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.businessName === "string" &&
    row.hero !== undefined &&
    row.about !== undefined &&
    row.seo !== undefined
  );
}

/**
 * POST /api/improve
 * Targeted AI improve via Content Review Engine + Retry.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new GenerateError(
        "UNAUTHORIZED",
        "Sign in to improve your website",
        401,
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      throw new GenerateError(
        "MISSING_API_KEY",
        "OpenAI API key not configured",
        503,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      throw new GenerateError("VALIDATION_ERROR", "Invalid JSON body", 400);
    }

    const scope = body.scope;
    if (typeof scope !== "string" || !IMPROVE_SCOPES.has(scope as ImproveScope)) {
      throw new GenerateError(
        "VALIDATION_ERROR",
        "scope must be hero, services, seo, or entire",
        400,
      );
    }

    if (!isGeneratedSite(body.site)) {
      throw new GenerateError("VALIDATION_ERROR", "site is required", 400);
    }

    const input =
      parseBusinessInput(
        body.input && typeof body.input === "object"
          ? (body.input as Record<string, unknown>)
          : body,
      ) ?? null;

    if (!input) {
      throw new GenerateError(
        "VALIDATION_ERROR",
        "Business input is required for improve",
        400,
      );
    }

    const result = await runImproveSite({
      site: websiteToGeneratedSite(body.site),
      input,
      scope: scope as ImproveScope,
      userEmail: session.user.email,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GenerateError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("Improve API error:", error);
    const mapped = mapOpenAiError(error);
    return NextResponse.json(
      { error: mapped.message, code: mapped.code },
      { status: mapped.status },
    );
  }
}
