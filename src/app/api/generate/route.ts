import { auth } from "@/auth";
import type { BusinessFormInput } from "@/lib/business-form";
import { assertCanCreateProject } from "@/lib/billing";
import { GenerateError, mapOpenAiError } from "@/lib/generate-errors";
import { generateSiteWithOpenAI } from "@/lib/generate-site-ai";
import { getProject, saveProject, updateProjectSite } from "@/lib/projects";
import { resolveSeoMemoryFromSite } from "@/lib/seo-memory";
import type { GenerateResult } from "@/lib/site-types";
import { logApiUsage } from "@/lib/usage";
import type { PipelineEvent } from "@/lib/ai/orchestrator/events";
import { NextResponse } from "next/server";

/** Fast path should finish well under this; hard-fail so the client never spins forever. */
export const maxDuration = 120;

const GENERATE_HARD_TIMEOUT_MS = 90_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(id);
        reject(err);
      },
    );
  });
}

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

function parsePrevious(body: Record<string, unknown>) {
  const previousRaw =
    body.previous && typeof body.previous === "object"
      ? (body.previous as Record<string, unknown>)
      : null;
  if (!previousRaw) return undefined;
  return {
    headline:
      typeof previousRaw.headline === "string"
        ? previousRaw.headline
        : typeof previousRaw.heroTitle === "string"
          ? previousRaw.heroTitle
          : undefined,
    subheadline:
      typeof previousRaw.subheadline === "string"
        ? previousRaw.subheadline
        : typeof previousRaw.heroSubtitle === "string"
          ? previousRaw.heroSubtitle
          : undefined,
    primaryCTA:
      typeof previousRaw.primaryCTA === "string"
        ? previousRaw.primaryCTA
        : typeof previousRaw.heroCta === "string"
          ? previousRaw.heroCta
          : undefined,
    heroTitle:
      typeof previousRaw.heroTitle === "string"
        ? previousRaw.heroTitle
        : undefined,
    heroSubtitle:
      typeof previousRaw.heroSubtitle === "string"
        ? previousRaw.heroSubtitle
        : undefined,
    heroCta:
      typeof previousRaw.heroCta === "string" ? previousRaw.heroCta : undefined,
    aboutText:
      typeof previousRaw.aboutText === "string"
        ? previousRaw.aboutText
        : undefined,
  };
}

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST /api/generate
 *
 * Supports JSON (default) or SSE when `stream: true` / Accept: text/event-stream.
 * SSE events: progress | result | error
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
        "businessName, category, location, description, services, phone, and email are required",
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

    const email = session.user.email?.trim();
    const regenerate = body.regenerate === true;
    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";
    const previous = parsePrevious(body);
    const wantsStream =
      body.stream === true ||
      request.headers.get("accept")?.includes("text/event-stream");

    const runGenerate = async (
      onEvent?: (event: PipelineEvent) => void,
      onProgress?: (payload: { stage: string; label: string }) => void,
    ) => {
      let seoMemory = undefined;
      if (regenerate && projectId && email) {
        try {
          const existing = await getProject(projectId, email);
          if (existing?.site) {
            seoMemory = resolveSeoMemoryFromSite(existing.site);
          }
        } catch (loadError) {
          console.warn("SEO Memory load skipped:", loadError);
        }
      }

      const site = await withTimeout(
        generateSiteWithOpenAI(input, {
          userEmail: email,
          regenerate,
          previous,
          seoMemory,
          onEvent,
          onProgress: (payload) =>
            onProgress?.({
              stage: payload.stage,
              label: payload.label,
            }),
        }),
        GENERATE_HARD_TIMEOUT_MS,
        "Crestis generate",
      );
      const result: GenerateResult = { site, source: "ai" };

      if (email) {
        try {
          if (regenerate && projectId) {
            const updated = await updateProjectSite({
              id: projectId,
              userEmail: email,
              site,
            });
            if (updated) result.projectId = updated.id;
            else result.projectId = projectId;
          } else {
            const denied = await assertCanCreateProject(email);
            if (denied) {
              (result as GenerateResult & { upgradeRequired?: boolean }).upgradeRequired =
                true;
            } else {
              const project = await saveProject({
                userEmail: email,
                input,
                site,
              });
              if (project) result.projectId = project.id;
            }
          }
        } catch (saveError) {
          console.error("Project save failed after generate:", saveError);
        }
      }

      return result;
    };

    if (wantsStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (event: string, data: unknown) => {
            controller.enqueue(encoder.encode(sseEncode(event, data)));
          };

          try {
            const result = await runGenerate(
              (event) => {
                send("progress", event);
              },
              (payload) => {
                send("progress", {
                  type: "stage:progress",
                  stage: payload.stage,
                  label: payload.label,
                });
              },
            );
            void logApiUsage({
              route: "/api/generate",
              userEmail: email,
              status: 200,
            });
            send("result", result);
            controller.close();
          } catch (openaiError) {
            console.error(
              "OpenAI generation failed:",
              openaiError instanceof Error
                ? { message: openaiError.message, stack: openaiError.stack }
                : openaiError,
            );
            const mapped = mapOpenAiError(openaiError);
            void logApiUsage({
              route: "/api/generate",
              status: mapped.status,
              meta: { code: mapped.code },
            });
            send("error", {
              error: mapped.message,
              code: mapped.code,
            });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    try {
      const result = await runGenerate();
      void logApiUsage({
        route: "/api/generate",
        userEmail: email,
        status: 200,
      });
      return NextResponse.json(result);
    } catch (openaiError) {
      console.error(
        "OpenAI generation failed:",
        openaiError instanceof Error
          ? { message: openaiError.message, stack: openaiError.stack }
          : openaiError,
      );
      throw mapOpenAiError(openaiError);
    }
  } catch (error) {
    if (error instanceof GenerateError) {
      void logApiUsage({
        route: "/api/generate",
        status: error.status,
        meta: { code: error.code },
      });
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("Generate API error:", error);
    void logApiUsage({ route: "/api/generate", status: 500 });
    return NextResponse.json(
      { error: "Failed to generate site", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
