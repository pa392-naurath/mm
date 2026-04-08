import { NextRequest, NextResponse } from "next/server";

import { getAdminIdentityOrNull } from "@/lib/security/admin";
import { ensureAdminUser, getLeadDetail } from "@/lib/tracking/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ leadRef: string }> },
) {
  const identity = await getAdminIdentityOrNull();

  if (!identity) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  await ensureAdminUser(identity.authUserId, identity.email);
  const { leadRef } = await params;
  const detail = await getLeadDetail(leadRef);

  if (!detail) {
    return NextResponse.json({ message: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ detail });
}
