import { expect, test } from "@playwright/test";

// Browser-only fixtures: no Supabase user is created and no real credentials
// or login requests are sent to the external service.
test.describe("Đăng nhập qua API cùng nguồn", () => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Cần giao diện được cấu hình để bật biểu mẫu đăng nhập.",
  );
  const cases = [
    {
      status: 401,
      code: "invalid_credentials",
      expected: "Email hoặc mật khẩu chưa đúng.",
    },
    {
      status: 503,
      code: "auth_network_error",
      expected: "Không kết nối được dịch vụ xác thực.",
    },
    {
      status: 504,
      code: "auth_timeout",
      expected: "Dịch vụ xác thực phản hồi quá thời gian chờ.",
    },
    {
      status: 503,
      code: "html_service_error",
      expected: "Dịch vụ xác thực đang tạm thời không khả dụng.",
    },
    {
      status: 504,
      code: "html_timeout_error",
      expected: "Dịch vụ xác thực phản hồi quá thời gian chờ.",
    },
  ];
  for (const scenario of cases) {
    test(`hiển thị đúng lỗi ${scenario.code} và không gọi Supabase từ trình duyệt`, async ({
      page,
    }) => {
      let directSupabaseRequests = 0;
      let applicationRequests = 0;
      await page.route("**/*.supabase.co/**", async (route) => {
        directSupabaseRequests++;
        await route.abort();
      });
      await page.route("**/api/auth/login", async (route) => {
        applicationRequests++;
        expect(route.request().method()).toBe("POST");
        expect(route.request().postDataJSON()).toEqual({
          email: "browser-test@example.com",
          password: "browser-test-password",
        });
        await route.fulfill({
          status: scenario.status,
          contentType: scenario.code.startsWith("html_")
            ? "text/html"
            : "application/json",
          body: scenario.code.startsWith("html_")
            ? "<html><body>private-provider-details</body></html>"
            : JSON.stringify({
                code: scenario.code,
                error: "private-provider-details",
              }),
        });
      });
      await page.goto("/login");
      await page
        .locator('input[name="email"]')
        .fill("browser-test@example.com");
      await page
        .locator('input[name="password"]')
        .fill("browser-test-password");
      await page
        .getByRole("button", { name: "Vào không gian học tập", exact: true })
        .click();
      const errorAlert = page.locator(".auth-form").getByRole("alert");
      await expect(errorAlert).toContainText(scenario.expected);
      await expect(errorAlert).not.toContainText("private-provider-details");
      await expect(
        page.getByRole("button", {
          name: "Vào không gian học tập",
          exact: true,
        }),
      ).toBeEnabled();
      expect(applicationRequests).toBe(1);
      expect(directSupabaseRequests).toBe(0);
    });
  }
});
