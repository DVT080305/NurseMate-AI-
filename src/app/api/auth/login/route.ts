import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { authFailure, authErrorMetadata } from "@/lib/auth-errors";
import { HttpError, apiError, readJson } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let stage = "origin_validation";
  try {
    const origin = request.headers.get("origin");
    if (
      (origin && origin !== new URL(request.url).origin) ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      throw Object.assign(new Error("INVALID_ORIGIN"), {
        code: "invalid_origin",
      });
    stage = "configuration";
    if (!isSupabaseConfigured())
      throw Object.assign(new Error("AUTH_CONFIGURATION_ERROR"), {
        code: "auth_configuration_error",
      });
    stage = "input_validation";
    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success)
      throw new HttpError(400, "Email hoặc mật khẩu không hợp lệ.");
    stage = "password_sign_in";
    const supabase = await createClient({
      strictCookies: true,
      context: "password_sign_in",
    });
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) throw error;
    if (!data.session || !data.user)
      throw Object.assign(new Error("AUTH_FAILED"), { code: "auth_failed" });
    // Supabase SSR writes the session into response cookies. Tokens are never
    // returned in the JSON payload or logged by this route.
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof HttpError) {
      console.warn("[Auth] login_failed", {
        requestId,
        stage,
        code: "invalid_request",
        status: error.status,
      });
      return apiError(error);
    }
    const failure = authFailure(error);
    const metadata = {
      requestId,
      stage,
      code: failure.code,
      status: failure.status,
      ...authErrorMetadata(error),
    };
    if (failure.status >= 500) console.error("[Auth] login_failed", metadata);
    else console.warn("[Auth] login_failed", metadata);
    return NextResponse.json(
      { error: failure.message, code: failure.code },
      {
        status: failure.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
