import { NextRequest, NextResponse } from "next/server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { env } from "@/lib/utils/env";
import type { Database } from "@/types/supabase";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  let response = NextResponse.redirect(new URL("/admin", requestUrl.origin));

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        response = NextResponse.redirect(new URL("/admin", requestUrl.origin));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const code = requestUrl.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
