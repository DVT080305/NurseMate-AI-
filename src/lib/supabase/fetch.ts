import "server-only";
import { authErrorMetadata } from "@/lib/auth-errors";

export function boundedSupabaseFetch(
  stage: "server" | "password_sign_in" | "session_refresh",
): typeof fetch {
  return async (input, init) => {
    const timeout = AbortSignal.timeout(12000);
    const signal = init?.signal
      ? AbortSignal.any([init.signal, timeout])
      : timeout;
    try {
      return await fetch(input, { ...init, signal, cache: "no-store" });
    } catch (error) {
      // Never log input/init: they contain credentials, tokens and request URLs.
      console.error("[Auth] upstream_fetch_failed", {
        stage,
        ...authErrorMetadata(error),
      });
      throw error;
    }
  };
}
