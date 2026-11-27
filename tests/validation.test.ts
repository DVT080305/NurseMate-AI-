import { describe, expect, it } from "vitest";
import {
  chatSchema,
  signupSchema,
  conversationSchema,
  profileSchema,
} from "@/lib/validation";
const valid = {
  conversationId: crypto.randomUUID(),
  requestId: crypto.randomUUID(),
  content: "Tôi muốn học.",
};
describe("Giới hạn dữ liệu đầu vào", () => {
  it("chấp nhận câu hỏi hợp lệ và loại bỏ khoảng trắng", () =>
    expect(chatSchema.parse({ ...valid, content: " Câu hỏi " }).content).toBe(
      "Câu hỏi",
    ));
  it.each(["role", "systemPrompt", "model", "user_id", "messages"])(
    "từ chối trường tùy chỉnh %s",
    (key) =>
      expect(
        chatSchema.safeParse({ ...valid, [key]: "override" }).success,
      ).toBe(false),
  );
  it("từ chối câu hỏi rỗng hoặc quá dài", () => {
    expect(chatSchema.safeParse({ ...valid, content: "  " }).success).toBe(
      false,
    );
    expect(
      chatSchema.safeParse({ ...valid, content: "a".repeat(4001) }).success,
    ).toBe(false);
  });
  it("kiểm tra email và mật khẩu đăng ký", () => {
    expect(
      signupSchema.safeParse({
        full_name: "An",
        email: "invalid",
        password: "123",
      }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        full_name: "Minh Anh",
        email: "student@example.com",
        password: "abcdefgh",
      }).success,
    ).toBe(true);
  });
  it("từ chối nhóm chức năng không hỗ trợ", () =>
    expect(conversationSchema.safeParse({ category: "admin" }).success).toBe(
      false,
    ));
  it("không cho sửa khóa chính trong hồ sơ", () =>
    expect(
      profileSchema.safeParse({
        id: crypto.randomUUID(),
        full_name: "An",
        career_goal: "",
        education_level: "",
      }).success,
    ).toBe(false));
});
