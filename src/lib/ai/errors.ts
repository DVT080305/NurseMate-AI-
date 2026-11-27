export type AiOutputFailure =
  | "empty_response"
  | "blocked_response"
  | "truncated_response"
  | "unexpected_finish_reason"
  | "invalid_json"
  | "invalid_schema"
  | "invalid_content";

export class AiOutputError extends Error {
  constructor(public readonly reason: AiOutputFailure) {
    super("INVALID_AI_OUTPUT");
    this.name = "AiOutputError";
  }
}

const providerStatuses = new Set([
  "INVALID_ARGUMENT",
  "UNAUTHENTICATED",
  "PERMISSION_DENIED",
  "NOT_FOUND",
  "RESOURCE_EXHAUSTED",
  "DEADLINE_EXCEEDED",
  "UNAVAILABLE",
  "INTERNAL",
]);
const networkCodes = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

// Allowlisted metadata only: never log a provider message, URL, headers, prompt,
// response body, thought content, access token, or API key.
export function geminiErrorMetadata(error: unknown) {
  const value = error as {
    status?: unknown;
    name?: unknown;
    message?: unknown;
    cause?: { code?: unknown };
  } | null;
  let providerStatus: string | undefined;
  if (typeof value?.message === "string") {
    try {
      const parsed = JSON.parse(value.message);
      if (providerStatuses.has(parsed?.error?.status))
        providerStatus = parsed.error.status;
    } catch {
      /* SDK network errors need not contain JSON. */
    }
  }
  const httpStatus =
    typeof value?.status === "number" &&
    Number.isInteger(value.status) &&
    value.status >= 400 &&
    value.status <= 599
      ? value.status
      : undefined;
  const networkCode =
    typeof value?.cause?.code === "string" && networkCodes.has(value.cause.code)
      ? value.cause.code
      : undefined;
  return {
    httpStatus,
    providerStatus,
    networkCode,
    outputFailure: error instanceof AiOutputError ? error.reason : undefined,
  };
}
