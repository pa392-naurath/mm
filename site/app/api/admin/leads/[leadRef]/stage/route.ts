import { NextRequest, NextResponse } from "next/server";

import { getAdminIdentityOrNull } from "@/lib/security/admin";
import { ensureAdminUser, updateLeadStageByRef } from "@/lib/tracking/service";
import { leadStageUpdateSchema } from "@/lib/validators/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadRef: string }> },
) {
  const identity = await getAdminIdentityOrNull();

  if (!identity) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "Invalid stage payload." }, { status: 400 });
  }

  const parsed = leadStageUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid stage payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const adminUser = await ensureAdminUser(identity.authUserId, identity.email);
    const { leadRef } = await params;
    const stage = await updateLeadStageByRef({
      leadRef,
      stage: parsed.data.newStage,
      changedByAdminUserId: adminUser.id,
      reason: parsed.data.reason ?? null,
    });

    return NextResponse.json({ ok: true, stage });
  } catch (error) {
    console.error("[api/admin/leads/stage] failed", error);
    return NextResponse.json({ message: "Unable to update lead stage." }, { status: 500 });
  }
}
