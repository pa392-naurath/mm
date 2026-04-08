import { NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/http/api";
import { applyTrackingCookies } from "@/lib/tracking/cookies";
import { getLeadByRef, logLeadEvent } from "@/lib/tracking/service";
import { resolveSessionForRequest } from "@/lib/tracking/public-context";
import { eventSchema } from "@/lib/validators/public";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonError("Invalid event payload.", 400);
  }

  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid event payload.", 400, {
      issues: parsed.error.flatten(),
    });
  }

  try {
    const { session, anonymousId } = await resolveSessionForRequest(request, {
      anonymousId: parsed.data.anonymousId,
      landingPage: parsed.data.pagePath ?? "/",
    });
    const lead = parsed.data.leadRef ? await getLeadByRef(parsed.data.leadRef) : null;

    await logLeadEvent({
      sessionId: session.id,
      leadId: lead?.id ?? null,
      eventName: parsed.data.eventName,
      eventSource: parsed.data.eventSource,
      productId: parsed.data.productId ?? null,
      collectionSlug: parsed.data.collectionSlug ?? null,
      metadata: {
        ...parsed.data.metadata,
        pagePath: parsed.data.pagePath ?? null,
      },
    });

    const response = NextResponse.json({ ok: true });

    return applyTrackingCookies(response, {
      anonymousId,
      sessionRef: session.session_ref,
      leadRef: lead?.lead_ref ?? parsed.data.leadRef,
    });
  } catch (error) {
    console.error("[api/events] failed", error);
    return jsonError("Unable to record event.", 500);
  }
}
