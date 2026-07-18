import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { generateFromForm } from "@/lib/generate-from-form";
import { formInputToPrompt } from "@/lib/form-to-prompt";
import { generateSiteFromPrompt } from "@/lib/generate-site";
import { generateSiteWithOpenAI } from "@/lib/generate-site-ai";
import type { GenerateResult } from "@/lib/site-types";
import { NextResponse } from "next/server";

function slugEmail(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "business";
  return `hello@${slug}.com`;
}

/** Accept new form, old form (type/description), or legacy { prompt } */
function parseInput(body: Record<string, unknown>): BusinessFormInput | null {
  // Legacy: { prompt: "..." }
  if (typeof body.prompt === "string" && body.prompt.trim()) {
    const prompt = body.prompt.trim();
    const nameMatch = prompt.match(/^([^—–\n]+)/);
    const name = nameMatch?.[1]?.replace(/Business name:\s*/i, "").trim() || "Your Business";
    const locationMatch =
      prompt.match(/Location:\s*(.+)/i) ||
      prompt.match(/\bin ([A-Z][A-Za-z\s]+)/);
    const servicesMatch = prompt.match(/Services:\s*(.+)/i);
    const phoneMatch = prompt.match(/Phone:\s*(.+)/i);
    const emailMatch = prompt.match(/Email:\s*(.+)/i);

    return {
      businessName: name.split("—")[0].trim() || name,
      location: locationMatch?.[1]?.trim().split(/[.\n]/)[0] || "Local area",
      services:
        servicesMatch?.[1]?.trim().split(/[.\n]/)[0] ||
        "General services, free estimates",
      phone: phoneMatch?.[1]?.trim().split(/[.\n]/)[0] || "(555) 000-0000",
      email: emailMatch?.[1]?.trim().split(/[.\n]/)[0] || slugEmail(name),
    };
  }

  const businessName =
    typeof body.businessName === "string" ? body.businessName.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : "";
  const services =
    typeof body.services === "string" ? body.services.trim() : "";

  if (!businessName || !location || !services) return null;

  const phone =
    typeof body.phone === "string" && body.phone.trim()
      ? body.phone.trim()
      : "(555) 000-0000";

  const email =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : slugEmail(businessName);

  return { businessName, location, services, phone, email };
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

    const body = (await request.json()) as Record<string, unknown>;
    const input = parseInput(body);

    if (!input) {
      return NextResponse.json(
        {
          error: "Business name, location, and services are required",
        },
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

      result = {
        site:
          typeof body.prompt === "string"
            ? generateSiteFromPrompt(String(body.prompt))
            : generateFromForm(input),
        source: "mock",
      };
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
