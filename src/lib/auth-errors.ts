type AuthFailure = { status: number; code: string; message: string };

const safeCodes = new Set([
  "invalid_credentials",
  "email_not_confirmed",
  "user_banned",
  "over_request_rate_limit",
  "over_email_send_rate_limit",
  "weak_password",
  "signup_disabled",
  "email_provider_disabled",
  "provider_disabled",
  "bad_jwt",
  "session_not_found",
  "session_expired",
  "refresh_token_not_found",
  "refresh_token_already_used",
  "unexpected_failure",
  "validation_failed",
  "auth_configuration_error",
  "auth_cookie_write_failed",
  "invalid_origin",
]);
const safeNames = new Set([
  "AuthApiError",
  "AuthRetryableFetchError",
  "AuthUnknownError",
  "AuthSessionMissingError",
  "TypeError",
  "AbortError",
  "TimeoutError",
]);
const safeNetworkCodes = new Set([
  "ENOTFOUND",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);
export function authErrorMetadata(error: unknown) {
  const value =
    error && typeof error === "object"
      ? (error as {
          code?: unknown;
          name?: unknown;
          status?: unknown;
          cause?: { code?: unknown };
        })
      : {};
  const networkCode =
    typeof value.cause?.code === "string" &&
    safeNetworkCodes.has(value.cause.code)
      ? value.cause.code
      : typeof value.code === "string" && safeNetworkCodes.has(value.code)
        ? value.code
        : undefined;
  return {
    upstreamCode:
      typeof value.code === "string" && safeCodes.has(value.code)
        ? value.code
        : undefined,
    upstreamStatus:
      typeof value.status === "number" &&
      Number.isInteger(value.status) &&
      value.status >= 0 &&
      value.status <= 599
        ? value.status
        : undefined,
    errorType:
      typeof value.name === "string" && safeNames.has(value.name)
        ? value.name
        : undefined,
    networkCode,
  };
}

export function authFailure(error: unknown): AuthFailure {
  const value =
    error && typeof error === "object"
      ? (error as {
          code?: unknown;
          status?: unknown;
          name?: unknown;
          message?: unknown;
        })
      : {};
  const code = typeof value.code === "string" ? value.code : "";
  const status = typeof value.status === "number" ? value.status : undefined;
  const message = typeof value.message === "string" ? value.message : "";
  if (code === "invalid_origin")
    return {
      status: 403,
      code,
      message:
        "Nguồn yêu cầu không hợp lệ. Bạn vui lòng tải lại trang đăng nhập.",
    };
  if (code === "auth_cookie_write_failed")
    return {
      status: 503,
      code,
      message: "Không lưu được phiên đăng nhập. Bạn vui lòng thử lại sau.",
    };
  if (
    ["invalid_credentials", "invalid_grant", "user_not_found"].includes(code) ||
    /invalid login credentials/i.test(message)
  )
    return {
      status: 401,
      code: "invalid_credentials",
      message: "Email hoặc mật khẩu chưa đúng.",
    };
  if (code === "email_not_confirmed")
    return {
      status: 403,
      code,
      message:
        "Supabase vẫn đang bật xác minh email. Vui lòng tắt Confirm Email trong Authentication → Sign In / Providers → Email rồi đăng nhập lại.",
    };
  if (
    ["over_email_send_rate_limit", "over_request_rate_limit"].includes(code) ||
    status === 429
  )
    return {
      status: 429,
      code: "over_request_rate_limit",
      message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
    };
  if (code === "weak_password")
    return {
      status: 400,
      code,
      message: "Mật khẩu chưa đủ mạnh. Hãy chọn mật khẩu khác.",
    };
  if (code === "user_banned")
    return {
      status: 403,
      code,
      message: "Tài khoản đang bị tạm khóa. Vui lòng liên hệ quản trị viên.",
    };
  if (["email_provider_disabled", "provider_disabled"].includes(code))
    return {
      status: 503,
      code: "auth_configuration_error",
      message: "Đăng nhập bằng email chưa được bật trong cấu hình Supabase.",
    };
  if (
    code === "auth_configuration_error" ||
    /invalid api key|invalid supabase|supabase.*required/i.test(message)
  )
    return {
      status: 503,
      code: "auth_configuration_error",
      message:
        "Kết nối xác thực chưa được cấu hình đúng. Vui lòng kiểm tra URL và publishable key Supabase rồi khởi động lại ứng dụng.",
    };
  if (
    code === "auth_timeout" ||
    status === 408 ||
    status === 504 ||
    ["TimeoutError", "AbortError"].includes(String(value.name)) ||
    /timed out|timeout/i.test(message)
  )
    return {
      status: 504,
      code: "auth_timeout",
      message:
        "Dịch vụ xác thực phản hồi quá thời gian chờ. Bạn vui lòng thử lại.",
    };
  if (code === "auth_network_error")
    return {
      status: 503,
      code: "auth_network_error",
      message:
        "Không kết nối được dịch vụ xác thực. Vui lòng kiểm tra kết nối mạng rồi thử lại.",
    };
  if (
    code === "auth_service_unavailable" ||
    (status !== undefined && status >= 500)
  )
    return {
      status: 503,
      code: "auth_service_unavailable",
      message:
        "Dịch vụ xác thực đang tạm thời không khả dụng. Bạn vui lòng thử lại sau.",
    };
  if (
    code === "auth_network_error" ||
    value.name === "AuthRetryableFetchError" ||
    /failed to fetch|fetch failed|networkerror|network request failed/i.test(
      message,
    )
  )
    return {
      status: 503,
      code: "auth_network_error",
      message:
        "Không kết nối được dịch vụ xác thực. Vui lòng kiểm tra kết nối mạng rồi thử lại.",
    };
  return {
    status: 400,
    code: "auth_failed",
    message: "Không thể xác thực. Vui lòng thử lại hoặc liên hệ quản trị viên.",
  };
}
