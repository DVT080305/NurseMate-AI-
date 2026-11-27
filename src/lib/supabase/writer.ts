import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

// Only server-verified chat writes use this client. User reads/CRUD always use RLS.
export function createWriter() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("CHAT_NOT_CONFIGURED");
  return createClient(publicEnv().url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
