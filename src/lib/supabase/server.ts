import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

export function createSupabaseServerClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase configuration is missing (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
