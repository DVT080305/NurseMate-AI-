import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import { boundedSupabaseFetch } from "@/lib/supabase/fetch";
export async function createClient(
  options: {
    strictCookies?: boolean;
    context?: "server" | "password_sign_in";
  } = {},
) {
  const store = await cookies();
  const { url, key } = publicEnv();
  return createServerClient(url, key, {
    global: { fetch: boundedSupabaseFetch(options.context ?? "server") },
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          if (options.strictCookies)
            throw Object.assign(
              new Error("Authentication cookie persistence failed."),
              { code: "auth_cookie_write_failed" },
            );
          /* Server Components cannot write cookies; proxy refreshes the session. */
        }
      },
    },
  });
}
