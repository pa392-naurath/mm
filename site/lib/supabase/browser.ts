"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/utils/public-env";
import type { Database } from "@/types/supabase";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  }

  return browserClient;
};
