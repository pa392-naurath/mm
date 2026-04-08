import { NextRequest, NextResponse } from "next/server";

import { getRequestIp, jsonError } from "@/lib/http/api";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { applyTrackingCookies } from "@/lib/tracking/cookies";
import { buildWhatsappPayload } from "@/lib/tracking/service";
import { resolveSessionForRequest } from "@/lib/tracking/public-context";
import { whatsappPayloadSchema } from "@/lib/validators/public";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonError("Invalid WhatsApp payload.", 400);
  }

  const parsed = whatsappPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid WhatsApp payload.", 400, {
      issues: parsed.error.flatten(),
    });
  }

  const rateLimit = applyRateLimit(`whatsapp:${parsed.data.anonymousId}:${getRequestIp(request)}`, {
    limit: 25,
    windowMs: 10 * 60_000,
  });

  if (!rateLimit.allowed) {
    return jsonError("Too many WhatsApp requests. Please try again shortly.", 429);
  }

  try {
    const { session, anonymousId } = await resolveSessionForRequest(request, {
      anonymousId: parsed.data.anonymousId,
    });
    const leadRef = request.cookies.get("mm_lead_ref")?.value ?? null;
    const payload = await buildWhatsappPayload({
      sessionId: session.id,
      anonymousId,
      leadRef,
      productIds: parsed.data.items.map((item) => item.productId),
      collectionSlug: parsed.data.collectionSlug ?? null,
      context: parsed.data.context,
    });

    const response = NextResponse.json({
      ok: true,
      ...payload,
      sessionRef: session.session_ref,
    });

    return applyTrackingCookies(response, {
      anonymousId,
      sessionRef: session.session_ref,
      leadRef: payload.leadRef,
    });
  } catch (error) {
    console.error("[api/whatsapp] failed", error);
    return jsonError("Unable to prepare WhatsApp message.", 500);
  }
}
