import OpenAI from "openai";
import { estimateOpenAiCostUsd, logOpenAiUsage } from "../usage";
import { resolveModelForStage } from "./model-router";
import {
  currentPipelineStep,
  recordStageTelemetry,
} from "../ai/telemetry/stage-telemetry";

let client: OpenAI | null = null;

const OPENAI_TIMEOUT_MS = 60_000;

export function getEngineOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!client) {
    client = new OpenAI({
      apiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 0,
    });
  }
  return client;
}

/**
 * GPT-5 / o-series only accept the default temperature (1).
 * Passing 0.7 / 1.05 etc. returns 400 — omit the param so the API uses default.
 */
function modelLocksDefaultTemperature(model: string): boolean {
  const id = model.toLowerCase();
  return (
    id.startsWith("gpt-5") ||
    id.startsWith("o1") ||
    id.startsWith("o3") ||
    id.startsWith("o4")
  );
}

function isGpt5Family(model: string): boolean {
  return model.toLowerCase().startsWith("gpt-5");
}

export async function completeJsonObject<T>(options: {
  system: string;
  user: string;
  temperature?: number;
  userEmail?: string | null;
  stage: string;
  /** Optional hard override — prefer stage routing via model-router */
  model?: string;
  /** Output token budget (GPT-5 uses max_completion_tokens) */
  maxCompletionTokens?: number;
}): Promise<T> {
  const openai = getEngineOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY is not configured");

  const model = options.model?.trim() || resolveModelForStage(options.stage);
  const lockedTemp = modelLocksDefaultTemperature(model);
  const gpt5 = isGpt5Family(model);
  const tokenBudget = options.maxCompletionTokens ?? (gpt5 ? 4096 : 4096);

  const startedMs = Date.now();
  const startedIso = new Date(startedMs).toISOString();
  let promptTokens = 0;
  let completionTokens = 0;
  let costUsd = 0;
  let status: "success" | "error" = "success";

  try {
  const response = await openai.chat.completions.create({
    model,
    ...(lockedTemp ? {} : { temperature: options.temperature ?? 0.7 }),
    response_format: { type: "json_object" },
    // GPT-5: minimal reasoning so JSON body is not starved / hung
    ...(gpt5
      ? {
          reasoning_effort: "minimal" as const,
          max_completion_tokens: tokenBudget,
        }
      : { max_tokens: tokenBudget }),
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
  });

  promptTokens = response.usage?.prompt_tokens ?? 0;
  completionTokens = response.usage?.completion_tokens ?? 0;
  costUsd = estimateOpenAiCostUsd({
    model,
    promptTokens,
    completionTokens,
  });

  void logOpenAiUsage({
    userEmail: options.userEmail,
    model,
    promptTokens,
    completionTokens,
    totalTokens: response.usage?.total_tokens ?? 0,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error(`ENGINE_EMPTY:${options.stage}`);

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`ENGINE_INVALID_JSON:${options.stage}`);
  }
  } catch (error) {
    status = "error";
    throw error;
  } finally {
    recordStageTelemetry({
      stage: options.stage,
      started: startedIso,
      finished: new Date().toISOString(),
      durationMs: Date.now() - startedMs,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
      costUsd,
      retries: 0,
      cacheHit: false,
      parentStep: currentPipelineStep(),
      status,
    });
  }
}
