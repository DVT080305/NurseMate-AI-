import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiOutputError, geminiErrorMetadata } from "@/lib/ai/errors";

const sdk = vi.hoisted(() => ({ generateContent: vi.fn(), options: vi.fn() }));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    constructor(options: unknown) {
      sdk.options(options);
    }
    models = { generateContent: sdk.generateContent };
  },
}));
import { generateAnswer, geminiError } from "@/lib/ai/gemini";

const content = JSON.stringify({
  kind: "answer",
  content: "Tôi có thể giúp bạn ôn tập.",
  sections: [],
});
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GEMINI_API_KEY", "private-unit-test-key");
  vi.stubEnv("GEMINI_MODEL", "gemini-3.6-flash");
  vi.spyOn(console, "error").mockImplementation(() => {});
  sdk.generateContent.mockResolvedValue({
    candidates: [
      { finishReason: "STOP", content: { parts: [{ text: content }] } },
    ],
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Gemini SDK và phân loại phản hồi", () => {
  it("đọc JSON cuối cùng từ parts, bỏ qua thought và phần không phải văn bản", async () => {
    sdk.generateContent.mockResolvedValue({
      candidates: [
        {
          finishReason: "STOP",
          content: {
            parts: [
              { text: "Suy luận không được hiển thị", thought: true },
              { text: content.slice(0, 15) },
              { thoughtSignature: "private-signature" },
              { text: content.slice(15) },
            ],
          },
        },
      ],
    });
    await expect(
      generateAnswer("procedures", [], "Câu hỏi kiểm thử", null),
    ).resolves.toBe("Tôi có thể giúp bạn ôn tập.");
  });
  it("giữ mô hình được cấu hình, giới hạn thời gian và không tự gọi lại", async () => {
    await generateAnswer("procedures", [], "Câu hỏi kiểm thử", null);
    expect(sdk.options).toHaveBeenCalledWith(
      expect.objectContaining({
        httpOptions: { timeout: 45000, retryOptions: { attempts: 1 } },
      }),
    );
    expect(sdk.generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-3.6-flash",
        config: expect.objectContaining({
          thinkingConfig: { thinkingLevel: "LOW" },
          maxOutputTokens: 4096,
        }),
      }),
    );
  });
  it("không gửi cấu hình suy luận riêng Gemini 3 sang mô hình khác", async () => {
    vi.stubEnv("GEMINI_MODEL", "gemini-2.5-flash");
    await generateAnswer("procedures", [], "Câu hỏi kiểm thử", null);
    expect(sdk.generateContent.mock.calls[0][0].config).not.toHaveProperty(
      "thinkingConfig",
    );
  });
  it.each([
    [
      {
        candidates: [
          {
            finishReason: "MAX_TOKENS",
            content: { parts: [{ text: '{"kind":' }] },
          },
        ],
      },
      "truncated_response",
    ],
    [{ candidates: [{ finishReason: "SAFETY" }] }, "blocked_response"],
    [{ promptFeedback: { blockReason: "SAFETY" } }, "blocked_response"],
    [{ candidates: [] }, "empty_response"],
    [
      { candidates: [{ finishReason: "STOP", content: { parts: [] } }] },
      "empty_response",
    ],
    [
      {
        candidates: [
          {
            finishReason: "STOP",
            content: { parts: [{ text: "Không phải JSON" }] },
          },
        ],
      },
      "invalid_json",
    ],
    [
      {
        candidates: [
          {
            finishReason: "STOP",
            content: { parts: [{ text: '{"answer":"Sai cấu trúc"}' }] },
          },
        ],
      },
      "invalid_schema",
    ],
  ])(
    "không nhận hoặc lưu phản hồi thiếu/sai cấu trúc %#",
    async (response, reason) => {
      sdk.generateContent.mockResolvedValue(response);
      await expect(
        generateAnswer("procedures", [], "Câu hỏi kiểm thử", null),
      ).rejects.toMatchObject({ reason });
    },
  );
  it("nhận diện đúng lỗi 504 thật và chỉ ghi metadata an toàn", async () => {
    const error = {
      status: 504,
      message: JSON.stringify({
        error: {
          code: 504,
          status: "DEADLINE_EXCEEDED",
          message: "private-unit-test-key",
        },
      }),
    };
    sdk.generateContent.mockRejectedValue(error);
    await expect(
      generateAnswer("procedures", [], "Nội dung riêng tư", null),
    ).rejects.toBe(error);
    expect(geminiError(error).status).toBe(504);
    const logs = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logs).toContain("DEADLINE_EXCEEDED");
    expect(logs).not.toContain("private-unit-test-key");
    expect(logs).not.toContain("Nội dung riêng tư");
  });
  it("phân biệt mô hình thiếu quyền, hết hạn chờ và bị chặn nội dung", () => {
    expect(geminiError({ status: 404 }).status).toBe(503);
    expect(geminiError({ status: 503 }).status).toBe(503);
    expect(geminiError({ name: "TimeoutError" }).status).toBe(504);
    expect(geminiError(new AiOutputError("blocked_response")).status).toBe(422);
    expect(geminiError(new AiOutputError("truncated_response")).status).toBe(
      502,
    );
  });
  it("không đưa trường tùy ý của provider vào log", () => {
    const metadata = geminiErrorMetadata({
      status: "secret",
      message: '{"error":{"status":"private-key"}}',
      cause: { code: "private-key" },
    });
    expect(JSON.stringify(metadata)).not.toContain("private-key");
    expect(metadata.httpStatus).toBeUndefined();
  });
});
