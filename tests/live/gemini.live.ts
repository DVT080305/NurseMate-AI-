import { expect, it } from "vitest";
import { generateAnswer } from "@/lib/ai/gemini";

it("Gemini thật xử lý câu hỏi bằng cùng mã của ứng dụng", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (String(input).includes("generativelanguage.googleapis.com")) {
      try {
        const body = await response.clone().json();
        console.info("Gemini response metadata", {
          httpStatus: response.status,
          errorStatus: body.error?.status,
          errorCode: body.error?.code,
          finishReason: body.candidates?.[0]?.finishReason,
          blockReason: body.promptFeedback?.blockReason,
          textLengths: body.candidates?.[0]?.content?.parts?.map(
            (p: { text?: string; thought?: boolean }) => ({
              length: p.text?.length ?? 0,
              thought: p.thought,
            }),
          ),
          usage: body.usageMetadata,
        });
      } catch {
        /* Do not print response bodies. */
      }
    }
    return response;
  };
  const started = Date.now();
  try {
    const answer = await generateAnswer(
      "procedures",
      [],
      "Tôi muốn ôn tập các nguyên tắc kiểm soát nhiễm khuẩn trong thực hành điều dưỡng. Trình bày ngắn gọn.",
      null,
    );
    console.info("Gemini live result", {
      durationMs: Date.now() - started,
      answerLength: answer.length,
    });
    expect(answer.length).toBeGreaterThan(0);
  } catch (error) {
    const e = error as {
      name?: string;
      status?: number;
      code?: string;
      message?: string;
      cause?: { code?: string };
    };
    console.info("Gemini live failure", {
      durationMs: Date.now() - started,
      name: e.name,
      status: e.status,
      code: e.code,
      causeCode: e.cause?.code,
      validationError: e.message === "INVALID_AI_OUTPUT",
    });
    throw new Error("Gemini live request failed; see safe metadata above.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
