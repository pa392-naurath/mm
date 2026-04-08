import { NextResponse } from "next/server";

import { getAdminIdentityOrNull } from "@/lib/security/admin";
import { ensureAdminUser, getSessionTableRows } from "@/lib/tracking/service";

export async function GET() {
  const identity = await getAdminIdentityOrNull();

  if (!identity) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  await ensureAdminUser(identity.authUserId, identity.email);
  const sessions = await getSessionTableRows();

  return NextResponse.json({ sessions });
}
