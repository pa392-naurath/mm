export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  whatsappNumber: process.env.MALLOWMAUVE_WHATSAPP_NUMBER ?? "919990709988",
  whatsappPrefill:
    process.env.WHATSAPP_PREFILL_DEFAULT_MESSAGE ??
    "Hello, I would like to learn more about MallowMauve collections. Kindly assist.",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
};
