import { createClient } from "@supabase/supabase-js";

/** Lazy anon Supabase client for MCP tool handlers. Reads env at call time, not import time. */
export function getPublicSupabase() {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
