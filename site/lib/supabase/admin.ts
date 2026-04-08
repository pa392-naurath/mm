import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";
import { env } from "@/lib/utils/env";

let adminClient: SupabaseClient<Database> | null = null;

export const getSupabaseAdminClient = () => {
  if (!adminClient) {
    adminClient = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
};
