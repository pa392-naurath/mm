import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/utils/env";

export interface AdminIdentity {
  authUserId: string;
  email: string;
}

export const getAdminIdentityOrNull = async (): Promise<AdminIdentity | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase() ?? "";

  if (!user || !email || !env.adminAllowedEmails.map((value) => value.toLowerCase()).includes(email)) {
    return null;
  }

  return {
    authUserId: user.id,
    email,
  };
};

export const requireAdminIdentity = async (): Promise<AdminIdentity> => {
  const identity = await getAdminIdentityOrNull();

  if (!identity) {
    redirect("/admin/login");
  }

  return identity;
};
