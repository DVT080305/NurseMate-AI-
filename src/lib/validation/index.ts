import { z } from "zod";

export const categorySchema = z.enum([
  "procedures",
  "terminology",
  "scenarios",
  "career",
]);
export const loginSchema = z
  .object({
    email: z.email("Email không hợp lệ.").max(254),
    password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(128),
  })
  .strict();
export const signupSchema = loginSchema.extend({
  full_name: z.string().trim().min(2, "Họ tên cần ít nhất 2 ký tự.").max(100),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.").max(128),
});
export const profileSchema = z
  .object({
    full_name: z.string().trim().min(2).max(100),
    career_goal: z.string().trim().max(500),
    education_level: z.string().trim().max(200),
  })
  .strict();
export const conversationSchema = z
  .object({
    category: categorySchema,
    title: z.string().trim().min(1).max(100).default("Cuộc hội thoại mới"),
  })
  .strict();
export const renameSchema = z
  .object({
    title: z.string().trim().min(1, "Vui lòng nhập tên hội thoại.").max(100),
  })
  .strict();
export const chatSchema = z
  .object({
    conversationId: z.uuid(),
    requestId: z.uuid(),
    content: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập câu hỏi.")
      .max(4000, "Câu hỏi tối đa 4.000 ký tự."),
  })
  .strict();
export const uuidSchema = z.uuid();
