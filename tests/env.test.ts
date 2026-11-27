import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { publicEnv, isSupabaseConfigured } from "@/lib/env";
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://unit-test.supabase.co");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "sb_publishable_unit_test_key",
  );
});
afterEach(() => vi.unstubAllEnvs());
it("trim public config và không yêu cầu Gemini để đăng nhập", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://unit-test.supabase.co \n");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    " sb_publishable_unit_test_key \n",
  );
  vi.stubEnv("GEMINI_MODEL", "");
  expect(isSupabaseConfigured()).toBe(true);
  expect(publicEnv()).toEqual({
    url: "https://unit-test.supabase.co",
    key: "sb_publishable_unit_test_key",
  });
});
it.each([
  "",
  "   ",
  "invalid-url",
  "ftp://unit-test.supabase.co",
  "https://unit-test.supabase.co/dashboard",
  "https://unit-test.supabase.co?token=secret",
  "https://user:secret@unit-test.supabase.co",
])("từ chối URL cấu hình không hợp lệ %#", (url) => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  expect(isSupabaseConfigured()).toBe(false);
  expect(() => publicEnv()).toThrow();
});
it("không chấp nhận secret key trong biến public", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_secret_example");
  expect(isSupabaseConfigured()).toBe(false);
});
