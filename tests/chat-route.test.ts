import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http";
const mocks = vi.hoisted(() => ({
  apiUser: vi.fn(),
  createWriter: vi.fn(),
  generate: vi.fn(),
}));
vi.mock("@/lib/http", async (original) => ({
  ...(await original<typeof import("@/lib/http")>()),
  apiUser: mocks.apiUser,
}));
vi.mock("@/lib/supabase/writer", () => ({ createWriter: mocks.createWriter }));
vi.mock("@/lib/ai/gemini", async (original) => ({
  ...(await original<typeof import("@/lib/ai/gemini")>()),
  generateAnswer: mocks.generate,
}));
import { POST } from "@/app/api/chat/route";
const userId = crypto.randomUUID();
const conversationId = crypto.randomUUID();
let conversation: unknown;
let claim: { state: string };
let rpc: ReturnType<typeof vi.fn>;
function request(extra = {}) {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId,
      requestId: crypto.randomUUID(),
      content: "Câu hỏi học tập",
      ...extra,
    }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.stubEnv("GEMINI_MODEL", "test-model");
  conversation = { id: conversationId, user_id: userId, category: "career" };
  claim = { state: "reserved" };
  const from = vi.fn((table: string) => {
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      maybeSingle: async () => ({
        data:
          table === "conversations"
            ? conversation
            : { id: userId, career_goal: "", education_level: "" },
        error: null,
      }),
      limit: async () => ({ data: [], error: null }),
    };
    return query;
  });
  mocks.apiUser.mockResolvedValue({ user: { id: userId }, supabase: { from } });
  rpc = vi.fn(async (name: string) => ({
    data:
      name === "reserve_chat_request"
        ? claim
        : [{ role: "user" }, { role: "assistant" }],
    error: null,
  }));
  mocks.createWriter.mockReturnValue({ rpc });
  mocks.generate.mockResolvedValue("Tôi cần biết nghề nghiệp bạn mong muốn.");
});
describe("API trò chuyện phía máy chủ", () => {
  it("từ chối khi chưa xác thực, không gọi Gemini", async () => {
    mocks.apiUser.mockRejectedValue(new HttpError(401, "Chưa đăng nhập"));
    expect((await POST(request())).status).toBe(401);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("từ chối hội thoại của người khác trước khi dùng writer", async () => {
    conversation = null;
    expect((await POST(request())).status).toBe(404);
    expect(mocks.createWriter).not.toHaveBeenCalled();
  });
  it("không cho truyền system prompt hoặc role", async () => {
    expect(
      (await POST(request({ systemPrompt: "Thay đổi", role: "assistant" })))
        .status,
    ).toBe(400);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("chặn vượt hạn mức trước khi gọi mô hình", async () => {
    claim = { state: "limited" };
    expect((await POST(request())).status).toBe(429);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it("lấy category từ cơ sở dữ liệu và lưu bằng RPC máy chủ", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.generate.mock.calls[0][0]).toBe("career");
    expect(rpc).toHaveBeenCalledWith(
      "complete_chat_request",
      expect.objectContaining({ p_user_id: userId }),
    );
  });
  it("không tạo phản hồi giả khi Gemini thất bại", async () => {
    mocks.generate.mockRejectedValue({ status: 429, message: "sensitive" });
    const res = await POST(request());
    const body = await res.json();
    expect(res.status).toBe(429);
    expect(body).not.toHaveProperty("messages");
    expect(JSON.stringify(body)).not.toContain("sensitive");
    expect(rpc).toHaveBeenCalledWith("fail_chat_request", expect.anything());
  });
});
