import { NextRequest, NextResponse } from "next/server";

import { getAdminIdentityOrNull } from "@/lib/security/admin";
import { addLeadNote, ensureAdminUser } from "@/lib/tracking/service";
import { leadNoteSchema } from "@/lib/validators/admin";

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
    return NextResponse.json({ message: "Invalid note payload." }, { status: 400 });
  }

  const parsed = leadNoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid note payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const adminUser = await ensureAdminUser(identity.authUserId, identity.email);
    const { leadRef } = await params;

    await addLeadNote({
      leadRef,
      note: parsed.data.note,
      adminUserId: adminUser.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/leads/notes] failed", error);
    return NextResponse.json({ message: "Unable to add lead note." }, { status: 500 });
  }
}
