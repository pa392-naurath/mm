import { NextResponse } from "next/server";

import { getAdminIdentityOrNull } from "@/lib/security/admin";
import { ensureAdminUser, getLeadTableRows } from "@/lib/tracking/service";

export async function GET() {
  const identity = await getAdminIdentityOrNull();

  if (!identity) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  await ensureAdminUser(identity.authUserId, identity.email);
  const leads = await getLeadTableRows();

  return NextResponse.json({ leads });
}
