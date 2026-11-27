import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ signIn: vi.fn(), configured: vi.fn() }));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: mocks.configured }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { signInWithPassword: mocks.signIn } }),
}));
import { POST } from "@/app/api/auth/login/route";

function request(
  body: unknown = {
    email: "student@example.com",
    password: "private-test-password",
  },
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured.mockReturnValue(true);
  mocks.signIn.mockResolvedValue({
    data: {
      user: { id: "test-user" },
      session: { access_token: "private-test-token" },
    },
    error: null,
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());
describe("API đăng nhập cùng nguồn", () => {
  it("xác thực bằng email/mật khẩu nhưng không trả token về JSON", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(mocks.signIn).toHaveBeenCalledWith({
      email: "student@example.com",
      password: "private-test-password",
    });
  });
  it("không chấp nhận yêu cầu đăng nhập từ nguồn khác", async () => {
    expect(
      (await POST(request(undefined, "https://untrusted.example"))).status,
    ).toBe(403);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it.each([
    { email: "invalid", password: "password" },
    { email: "student@example.com", password: "" },
    { email: "student@example.com", password: "password", role: "admin" },
  ])("kiểm tra dữ liệu trước khi gọi Supabase %#", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it("hiển thị đúng lỗi mật khẩu mà không lộ phản hồi gốc", async () => {
    mocks.signIn.mockResolvedValue({
      data: {},
      error: {
        status: 400,
        code: "invalid_credentials",
        message: "private-provider-details",
      },
    });
    const response = await POST(request());
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.code).toBe("invalid_credentials");
    expect(JSON.stringify(body)).not.toContain("private-provider-details");
  });
  it("phân loại lỗi mạng và chỉ ghi mã lỗi vào log", async () => {
    mocks.signIn.mockRejectedValue({
      name: "AuthRetryableFetchError",
      status: 0,
      message: "private-api-key",
    });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("auth_network_error");
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(
      /private-api-key|private-test-password|student@example.com/,
    );
  });
  it("không báo thành công khi Supabase chưa cấp phiên", async () => {
    mocks.signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    expect((await POST(request())).status).toBe(400);
  });
  it("báo thiếu cấu hình trước khi gọi Supabase", async () => {
    mocks.configured.mockReturnValue(false);
    expect((await POST(request())).status).toBe(503);
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it("đăng nhập không phụ thuộc Gemini key/model hoặc Supabase secret key", async () => {
    vi.stubEnv("GEMINI_MODEL", "");
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    try {
      expect((await POST(request())).status).toBe(200);
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("ghi mã lỗi Supabase an toàn cho lỗi thông tin đăng nhập", async () => {
    mocks.signIn.mockResolvedValue({
      data: {},
      error: {
        status: 400,
        name: "AuthApiError",
        code: "invalid_credentials",
        message: "private-password",
      },
    });
    await POST(request());
    expect(console.warn).toHaveBeenCalledWith(
      "[Auth] login_failed",
      expect.objectContaining({
        upstreamCode: "invalid_credentials",
        upstreamStatus: 400,
        stage: "password_sign_in",
      }),
    );
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(
      "private-password",
    );
  });
});
