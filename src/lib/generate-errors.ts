export type GenerateErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "QUOTA_EXCEEDED"
  | "OPENAI_EMPTY"
  | "OPENAI_INVALID_JSON"
  | "OPENAI_SCHEMA"
  | "OPENAI_FAILED"
  | "SERVER_ERROR";

export class GenerateError extends Error {
  code: GenerateErrorCode;
  status: number;

  constructor(code: GenerateErrorCode, message: string, status: number) {
    super(message);
    this.name = "GenerateError";
    this.code = code;
    this.status = status;
  }
}

export function mapOpenAiError(error: unknown): GenerateError {
  const message =
    error instanceof Error ? error.message : "OpenAI request failed";

  if (
    message.includes("401") ||
    message.includes("Incorrect API key") ||
    message.includes("invalid_api_key")
  ) {
    return new GenerateError(
      "INVALID_API_KEY",
      "Invalid OpenAI API key",
      401,
    );
  }

  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate_limit")
  ) {
    return new GenerateError(
      "QUOTA_EXCEEDED",
      "OpenAI quota exceeded. Check billing at platform.openai.com",
      429,
    );
  }

  if (message === "OPENAI_EMPTY") {
    return new GenerateError(
      "OPENAI_EMPTY",
      "OpenAI returned an empty response",
      502,
    );
  }

  if (
    message === "OPENAI_INVALID_JSON" ||
    message.startsWith("INVALID_FIELD") ||
    message === "INVALID_JSON_SHAPE"
  ) {
    return new GenerateError(
      "OPENAI_SCHEMA",
      "OpenAI returned incomplete website JSON",
      502,
    );
  }

  return new GenerateError("OPENAI_FAILED", message, 502);
}
