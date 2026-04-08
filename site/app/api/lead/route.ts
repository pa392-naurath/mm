import { NextRequest, NextResponse } from "next/server";

import { getRequestIp, jsonError } from "@/lib/http/api";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { applyTrackingCookies } from "@/lib/tracking/cookies";
import { logLeadEvent } from "@/lib/tracking/service";
import { resolveSessionLeadForRequest } from "@/lib/tracking/public-context";
import { contactInquirySchema } from "@/lib/validators/public";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonError("Invalid inquiry payload.", 400);
  }

  const parsed = contactInquirySchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid inquiry payload.", 400, {
      issues: parsed.error.flatten(),
    });
  }

  const rateLimit = applyRateLimit(`lead:${parsed.data.anonymousId}:${getRequestIp(request)}`, {
    limit: 10,
    windowMs: 15 * 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many inquiries submitted. Please wait and try again.", 429);
  }

  try {
    const { session, lead, anonymousId } = await resolveSessionLeadForRequest(request, {
      anonymousId: parsed.data.anonymousId,
    });
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("contact_inquiries").insert({
      session_id: session.id,
      lead_id: lead.id,
      name: parsed.data.name,
      contact: parsed.data.contact,
      email: parsed.data.email,
      location: parsed.data.location,
      inquiry_note: parsed.data.note,
    });

    if (error) {
      throw error;
    }

    await logLeadEvent({
      sessionId: session.id,
      leadId: lead.id,
      eventName: "contact_inquiry_submitted",
      eventSource: "site",
      metadata: {
        email: parsed.data.email,
        location: parsed.data.location,
      },
    });

    const response = NextResponse.json({
      ok: true,
      sessionRef: session.session_ref,
      leadRef: lead.lead_ref,
      message: "Inquiry received.",
    });

    return applyTrackingCookies(response, {
      anonymousId,
      sessionRef: session.session_ref,
      leadRef: lead.lead_ref,
    });
  } catch (error) {
    console.error("[api/lead] failed", error);
    return jsonError("Unable to capture inquiry right now.", 500);
  }
}
