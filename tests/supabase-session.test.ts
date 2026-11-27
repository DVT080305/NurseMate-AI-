import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  makeClient: vi.fn(),
  getUser: vi.fn(),
  setCookie: vi.fn(),
  options: null as unknown,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: mocks.setCookie }),
}));
vi.mock("@supabase/ssr", () => ({ createServerClient: mocks.makeClient }));
import { createClient } from "@/lib/supabase/server";
import { boundedSupabaseFetch } from "@/lib/supabase/fetch";
import { proxy } from "@/proxy";

type Options = {
  cookies: {
    setAll(
      values: Array<{
        name: string;
        value: string;
        options: { path: string; secure?: boolean; sameSite?: "lax" };
      }>,
    ): void;
  };
  global: { fetch: typeof fetch };
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://unit-test.supabase.co");
  vi.stubEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "sb_publishable_unit_test_key",
  );
  mocks.makeClient.mockImplementation((_url, _key, options) => {
    mocks.options = options;
    return { auth: { getUser: mocks.getUser } };
  });
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mocks.setCookie.mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Phiên đăng nhập trên máy chủ và proxy", () => {
  it("login không bị chặn bởi việc làm mới cookie cũ trong proxy", async () => {
    await proxy(
      new NextRequest("https://nurse-mate-ai.vercel.app/api/auth/login", {
        method: "POST",
        headers: { cookie: "sb-stale-auth-token=stale" },
      }),
    );
    expect(mocks.makeClient).not.toHaveBeenCalled();
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
  it("các trang riêng tư vẫn kiểm tra người dùng và không cache", async () => {
    const response = await proxy(
      new NextRequest("https://nurse-mate-ai.vercel.app/dashboard"),
    );
    expect(mocks.getUser).toHaveBeenCalledOnce();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
  it("cookie mới giữ nguyên các thuộc tính bảo mật", async () => {
    mocks.getUser.mockImplementation(async () => {
      (mocks.options as Options).cookies.setAll([
        {
          name: "sb-test-auth-token",
          value: "private-test-token",
          options: { path: "/", secure: true, sameSite: "lax" },
        },
      ]);
      return { data: { user: { id: "unit" } }, error: null };
    });
    const response = await proxy(
      new NextRequest("https://nurse-mate-ai.vercel.app/dashboard"),
    );
    expect(response.headers.get("Set-Cookie")).toContain("Secure");
    expect(response.headers.get("Set-Cookie")).toContain("SameSite=lax");
  });
  it("không che lỗi ghi cookie trong route đăng nhập", async () => {
    await createClient({ strictCookies: true, context: "password_sign_in" });
    mocks.setCookie.mockImplementation(() => {
      throw new Error("not writable");
    });
    expect(() =>
      (mocks.options as Options).cookies.setAll([
        {
          name: "sb-test",
          value: "private-test-token",
          options: { path: "/" },
        },
      ]),
    ).toThrow("Authentication cookie persistence failed.");
  });
  it("Server Component vẫn cho phép cookie chỉ đọc", async () => {
    await createClient();
    mocks.setCookie.mockImplementation(() => {
      throw new Error("read-only component");
    });
    expect(() =>
      (mocks.options as Options).cookies.setAll([
        { name: "sb-test", value: "unit", options: { path: "/" } },
      ]),
    ).not.toThrow();
  });
  it("ghi mã DNS nhưng không ghi URL, mật khẩu hay key khi fetch lỗi", async () => {
    const failure = Object.assign(
      new TypeError("secret-password secret-api-key"),
      { cause: { code: "ENOTFOUND" } },
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(failure));
    await expect(
      boundedSupabaseFetch("password_sign_in")("https://private-host.invalid", {
        body: "private-password",
      }),
    ).rejects.toBe(failure);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain("ENOTFOUND");
    expect(logged).not.toMatch(/private-host|private-password|secret-/);
  });
  it("mọi yêu cầu Supabase phía máy chủ có deadline và không cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await boundedSupabaseFetch("server")(
      "https://unit-test.supabase.co/auth/v1/user",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
