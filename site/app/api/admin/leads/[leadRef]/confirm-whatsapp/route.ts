import { NextRequest, NextResponse } from "next/server";

import { getAdminIdentityOrNull } from "@/lib/security/admin";
import { ensureAdminUser, markWhatsappConfirmed } from "@/lib/tracking/service";
import { confirmWhatsappSchema } from "@/lib/validators/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leadRef: string }> },
) {
  const identity = await getAdminIdentityOrNull();

  if (!identity) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = confirmWhatsappSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid WhatsApp confirmation payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const adminUser = await ensureAdminUser(identity.authUserId, identity.email);
    const { leadRef } = await params;
    const lead = await markWhatsappConfirmed({
      leadRef,
      changedByAdminUserId: adminUser.id,
      confirmedAt: parsed.data.confirmedAt ?? null,
      reason: parsed.data.reason ?? null,
    });

    return NextResponse.json({ ok: true, leadRef: lead.lead_ref });
  } catch (error) {
    console.error("[api/admin/leads/confirm-whatsapp] failed", error);
    return NextResponse.json({ message: "Unable to confirm WhatsApp lead." }, { status: 500 });
  }
}
