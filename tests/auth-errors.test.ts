import { describe, expect, it } from "vitest";
import { authFailure, authErrorMetadata } from "@/lib/auth-errors";

describe("Thông báo lỗi xác thực an toàn", () => {
  it.each([
    [{ code: "invalid_credentials" }, 401, "invalid_credentials"],
    [{ code: "email_not_confirmed" }, 403, "email_not_confirmed"],
    [{ code: "over_request_rate_limit" }, 429, "over_request_rate_limit"],
    [{ status: 429 }, 429, "over_request_rate_limit"],
    [{ code: "weak_password" }, 400, "weak_password"],
    [{ code: "user_banned" }, 403, "user_banned"],
    [{ code: "email_provider_disabled" }, 503, "auth_configuration_error"],
    [
      { status: 401, message: "Invalid API key" },
      503,
      "auth_configuration_error",
    ],
    [{ name: "AuthRetryableFetchError", status: 0 }, 503, "auth_network_error"],
    [
      { name: "AuthRetryableFetchError", status: 503 },
      503,
      "auth_service_unavailable",
    ],
    [
      { name: "TypeError", message: "Failed to fetch" },
      503,
      "auth_network_error",
    ],
    [{ name: "TimeoutError" }, 504, "auth_timeout"],
    [{ status: 504 }, 504, "auth_timeout"],
    [
      {
        name: "AuthRetryableFetchError",
        status: 0,
        message: "The operation was aborted due to timeout",
      },
      504,
      "auth_timeout",
    ],
    [{ code: "auth_cookie_write_failed" }, 503, "auth_cookie_write_failed"],
    [{ code: "invalid_origin" }, 403, "invalid_origin"],
  ])("phân loại lỗi theo mã/trạng thái/tên %#", (error, status, code) => {
    expect(authFailure(error)).toMatchObject({ status, code });
  });
  it.each([
    null,
    undefined,
    "unknown",
    { message: "private-password private-api-key" },
  ])("không hiển thị nội dung lỗi tùy ý %#", (error) => {
    expect(authFailure(error).message).not.toMatch(
      /private-password|private-api-key/,
    );
    expect(authFailure(error).code).toBe("auth_failed");
  });
  it("giữ nguyên phân loại khi lỗi đi qua API của ứng dụng", () => {
    for (const error of [
      { name: "AuthRetryableFetchError", status: 0 },
      { name: "TimeoutError" },
      { code: "invalid_credentials" },
    ]) {
      const failure = authFailure(error);
      expect(
        authFailure({ code: failure.code, status: failure.status }),
      ).toEqual(failure);
    }
  });
  it("log mã DNS và mã Supabase nhưng không ghi thông tin nhạy cảm", () => {
    const metadata = authErrorMetadata({
      name: "AuthApiError",
      code: "invalid_credentials",
      status: 400,
      cause: { code: "ENOTFOUND" },
      message: "secret-password secret-api-key user@example.com",
    });
    expect(metadata).toEqual({
      errorType: "AuthApiError",
      upstreamCode: "invalid_credentials",
      upstreamStatus: 400,
      networkCode: "ENOTFOUND",
    });
    expect(JSON.stringify(metadata)).not.toMatch(/secret-|user@example.com/);
    expect(
      authErrorMetadata({
        code: "secret-api-key",
        name: "secret-password",
        status: Infinity,
      }),
    ).toEqual({
      upstreamCode: undefined,
      upstreamStatus: undefined,
      errorType: undefined,
      networkCode: undefined,
    });
  });
});
