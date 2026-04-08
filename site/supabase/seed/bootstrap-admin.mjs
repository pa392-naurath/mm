import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_ALLOWED_EMAILS = "",
} = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env vars required for admin bootstrap.");
}

const emails = ADMIN_ALLOWED_EMAILS.split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (emails.length === 0) {
  throw new Error("ADMIN_ALLOWED_EMAILS must contain at least one email.");
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data, error } = await supabase.auth.admin.listUsers();

if (error) {
  throw error;
}

const allowedUsers = data.users.filter((user) => emails.includes(user.email?.toLowerCase() ?? ""));

for (const user of allowedUsers) {
  const name = user.email?.split("@")[0] ?? "admin";

  const { error: upsertError } = await supabase.from("admin_users").upsert(
    {
      auth_user_id: user.id,
      email: user.email,
      name,
      role: "admin",
    },
    { onConflict: "email" },
  );

  if (upsertError) {
    throw upsertError;
  }
}

console.log(`Bootstrapped ${allowedUsers.length} admin user(s).`);
