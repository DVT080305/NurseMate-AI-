import { test, expect } from "@playwright/test";
test("trang chủ hiển thị tiếng Việt và điều hướng học tập", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Vững kiến thức",
  );
  await expect(page.locator("#chuc-nang .feature-card")).toHaveCount(4);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByRole("link", { name: "Bắt đầu hành trình học tập" }).click();
  await expect(page).toHaveURL(/\/register$/);
});
test("chặn dashboard, chat và hội thoại khi chưa đăng nhập", async ({
  page,
}) => {
  for (const path of [
    "/dashboard",
    "/chat",
    "/chat/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});
test("không có cấu hình sẽ báo rõ thay vì giả lập đăng nhập", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    "Chỉ kiểm tra trạng thái chưa cấu hình.",
  );
  await page.goto("/login");
  await expect(page.getByRole("status")).toContainText("chờ kết nối Supabase");
  await expect(
    page.getByRole("button", { name: "Vào không gian học tập" }),
  ).toBeDisabled();
});
test("API không chấp nhận gửi chat khi chưa xác thực", async ({ request }) => {
  const res = await request.post("/api/chat", {
    data: {
      conversationId: crypto.randomUUID(),
      requestId: crypto.randomUUID(),
      content: "Xin chào",
    },
  });
  expect([401, 503]).toContain(res.status());
  const body = await res.json();
  expect(body).toHaveProperty("error");
  expect(body).not.toHaveProperty("messages");
});
test("chặn nguồn yêu cầu khác", async ({ request }) => {
  const res = await request.post("/api/conversations", {
    headers: { Origin: "https://untrusted.example" },
    data: { category: "career" },
  });
  expect(res.status()).toBe(403);
});
