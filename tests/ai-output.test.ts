import { describe, expect, it } from "vitest";
import { parseOutput } from "@/lib/ai/output";
import { systemPrompt } from "@/lib/ai/system-prompt";
import { geminiError } from "@/lib/ai/gemini";
describe("Kiểm tra đầu ra Gemini", () => {
  it("chấp nhận câu hỏi làm rõ nghề nghiệp", () =>
    expect(
      parseOutput(
        JSON.stringify({
          kind: "clarification",
          content: "Tôi cần biết nghề nghiệp bạn mong muốn là gì?",
          sections: [],
        }),
        "career",
      ),
    ).toContain("nghề nghiệp"));
  it("cố định đúng ba phần cho lộ trình nghề nghiệp", () => {
    const text = parseOutput(
      JSON.stringify({
        kind: "roadmap",
        content: "",
        sections: [
          "Tôi đề xuất bạn xác định năng lực.",
          "Bạn có thể xây dựng kế hoạch học tập.",
          "Thời gian đề xuất là ba tháng, không phải cam kết.",
        ],
      }),
      "career",
    );
    expect(text.match(/^## /gm)).toHaveLength(3);
  });
  it("không ép ba phần đối với học tập", () =>
    expect(
      parseOutput(
        JSON.stringify({
          kind: "answer",
          content: "Tôi sẽ giúp bạn ôn tập.",
          sections: [],
        }),
        "procedures",
      ),
    ).not.toContain("##"));
  it.each([
    { kind: "roadmap", content: "", sections: ["Một", "Hai"] },
    { kind: "roadmap", content: "Lời mở đầu", sections: ["Một", "Hai", "Ba"] },
    { kind: "answer", content: "Lộ trình", sections: [] },
    { kind: "clarification", content: "Chào bạn 😀", sections: [] },
    {
      kind: "roadmap",
      content: "",
      sections: ["## Tiêu đề khác", "Hai", "Ba"],
    },
  ])("từ chối đầu ra nghề nghiệp sai cấu trúc %#", (payload) =>
    expect(() => parseOutput(JSON.stringify(payload), "career")).toThrow(),
  );
  it("prompt yêu cầu hỏi nghề nghiệp và không tự giả định", () => {
    expect(systemPrompt("career")).toContain("Không tự giả định nghề nghiệp");
    expect(systemPrompt("career")).toContain("kinh nghiệm");
  });
  it("không trả chi tiết lỗi hoặc khóa từ nhà cung cấp", () => {
    const result = geminiError({
      status: 403,
      message: "secret-provider-details",
    });
    expect(result.status).toBe(503);
    expect(result.message).not.toContain("secret-provider-details");
  });
  it("phân biệt hạn mức và thời gian chờ", () => {
    expect(geminiError({ status: 429 }).status).toBe(429);
    expect(geminiError({ name: "AbortError" }).status).toBe(504);
  });
});
