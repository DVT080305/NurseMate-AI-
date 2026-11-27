import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { boundedSupabaseFetch } from "@/lib/supabase/fetch";
import { authErrorMetadata } from "@/lib/auth-errors";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  // New credentials must be processed even if an old session cookie is stale.
  // The login handler validates credentials and origin independently.
  if (request.nextUrl.pathname === "/api/auth/login") return response;
  if (!isSupabaseConfigured()) return response;
  const { url, key } = publicEnv();
  const supabase = createServerClient(url, key, {
    global: { fetch: boundedSupabaseFetch("session_refresh") },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  try {
    const { error } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError")
      console.warn("[Auth] session_refresh_failed", authErrorMetadata(error));
  } catch (error) {
    console.error("[Auth] session_refresh_failed", authErrorMetadata(error));
    // Protected pages and API handlers still verify the user with getUser().
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/api/:path*", "/auth/:path*"],
};
