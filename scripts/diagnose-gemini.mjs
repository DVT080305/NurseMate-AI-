import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const key = process.env.GEMINI_API_KEY?.trim();
const model = process.env.GEMINI_MODEL?.trim();
if (!key || !model) {
  console.error("Thiếu GEMINI_API_KEY hoặc GEMINI_MODEL.");
  process.exit(1);
}
function sanitizedError(error) {
  const clean = (value) =>
    typeof value === "string"
      ? value
          .replaceAll(key, "[REDACTED]")
          .replace(/AIza[\w-]+/g, "[REDACTED]")
          .replace(/([?&]key=)[^&\s]+/g, "$1[REDACTED]")
      : value;
  return {
    name: clean(error?.name),
    status: error?.status,
    code: clean(error?.code),
    message: clean(error?.message),
    cause: error?.cause
      ? {
          name: clean(error.cause.name),
          code: clean(error.cause.code),
          message: clean(error.cause.message),
        }
      : undefined,
  };
}
const lowThinking = process.env.GEMINI_DIAGNOSTIC_LOW_THINKING === "1";
const timeout = 45000;
const ai = new GoogleGenAI({
  apiKey: key,
  httpOptions: { timeout, retryOptions: { attempts: 1 } },
});
try {
  const info = await ai.models.get({ model });
  console.log(
    JSON.stringify({
      stage: "model",
      name: info.name,
      supportedActions: info.supportedActions,
    }),
  );
} catch (error) {
  console.log(JSON.stringify({ stage: "model", error: sanitizedError(error) }));
}
try {
  const started = Date.now();
  const result = await ai.models.generateContent({
    model,
    contents:
      "Trả lời bằng tiếng Việt, xưng tôi và bạn: bạn có thể hỗ trợ tôi học tập như thế nào? Trả về kind=answer, content là câu trả lời, sections là mảng rỗng.",
    config: {
      ...(lowThinking
        ? {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            temperature: 1,
          }
        : { temperature: 0.3 }),
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["answer"] },
          content: { type: "string" },
          sections: { type: "array", items: { type: "string" }, maxItems: 3 },
        },
        required: ["kind", "content", "sections"],
        additionalProperties: false,
      },
      maxOutputTokens: 4096,
    },
  });
  const text = result.text;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* Report shape without exposing output. */
  }
  console.log(
    JSON.stringify({
      stage: "generate",
      durationMs: Date.now() - started,
      finishReason: result.candidates?.[0]?.finishReason,
      blockReason: result.promptFeedback?.blockReason,
      partTypes: result.candidates?.[0]?.content?.parts?.map((p) => ({
        hasText: !!p.text,
        thought: p.thought,
      })),
      textLength: text?.length ?? 0,
      jsonKeys: parsed && Object.keys(parsed),
      kind: parsed?.kind,
      sectionsCount: parsed?.sections?.length,
      usage: result.usageMetadata,
    }),
  );
} catch (error) {
  console.log(
    JSON.stringify({
      stage: "generate",
      lowThinking,
      timeout,
      error: sanitizedError(error),
    }),
  );
  process.exitCode = 1;
}
