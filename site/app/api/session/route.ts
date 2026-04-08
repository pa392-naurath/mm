import { NextRequest, NextResponse } from "next/server";

import { getRequestIp, jsonError } from "@/lib/http/api";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { getLeadByRef, getLeadBySessionId, getOrCreateSession } from "@/lib/tracking/service";
import { applyTrackingCookies, trackingCookies } from "@/lib/tracking/cookies";
import { sessionSchema } from "@/lib/validators/public";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonError("Invalid session payload.", 400);
  }

  const parsed = sessionSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid session payload.", 400, {
      issues: parsed.error.flatten(),
    });
  }

  const cookieAnonymousId = request.cookies.get(trackingCookies.anonymous)?.value ?? null;
  const cookieSessionRef = request.cookies.get(trackingCookies.session)?.value ?? null;
  const cookieLeadRef = request.cookies.get(trackingCookies.lead)?.value ?? null;
  const anonymousId = cookieAnonymousId ?? parsed.data.anonymousId;
  const rateLimit = applyRateLimit(`session:${anonymousId}:${getRequestIp(request)}`, {
    limit: 40,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many session requests. Please try again shortly.", 429);
  }

  try {
    const session = await getOrCreateSession({
      ...parsed.data,
      anonymousId,
      sessionRef: cookieSessionRef,
    });

    const lead =
      (cookieLeadRef ? await getLeadByRef(cookieLeadRef) : null) ??
      (await getLeadBySessionId(session.id));

    const response = NextResponse.json({
      anonymousId,
      sessionId: session.id,
      sessionRef: session.session_ref,
      leadRef: lead?.lead_ref ?? null,
      stage: lead?.stage ?? session.current_status,
    });

    return applyTrackingCookies(response, {
      anonymousId,
      sessionRef: session.session_ref,
      leadRef: lead?.lead_ref ?? cookieLeadRef,
    });
  } catch (error) {
    console.error("[api/session] failed", error);
    return jsonError("Unable to initialise session.", 500);
  }
}
