export function isSupabaseConfigured() {
  try {
    publicEnv();
    return true;
  } catch {
    return false;
  }
}
export function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const configurationError = () =>
    Object.assign(
      new Error("Supabase authentication configuration is invalid."),
      { code: "auth_configuration_error" },
    );
  if (!url || !key || key.startsWith("sb_secret_")) throw configurationError();
  try {
    const parsed = new URL(url);
    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      parsed.pathname !== "/"
    )
      throw configurationError();
  } catch {
    throw configurationError();
  }
  return { url, key };
}
