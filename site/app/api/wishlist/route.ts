import { NextRequest, NextResponse } from "next/server";

import { getRequestIp, jsonError } from "@/lib/http/api";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { applyTrackingCookies } from "@/lib/tracking/cookies";
import { removeWishlistItem, upsertWishlistItem } from "@/lib/tracking/service";
import { resolveSessionLeadForRequest } from "@/lib/tracking/public-context";
import { listMutationSchema } from "@/lib/validators/public";

const rateLimitOptions = {
  limit: 40,
  windowMs: 5 * 60_000,
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonError("Invalid wishlist payload.", 400);
  }

  const parsed = listMutationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid wishlist payload.", 400, {
      issues: parsed.error.flatten(),
    });
  }

  const rateLimit = applyRateLimit(`wishlist:${parsed.data.anonymousId}:${getRequestIp(request)}`, rateLimitOptions);

  if (!rateLimit.allowed) {
    return jsonError("Too many wishlist updates. Please try again shortly.", 429);
  }

  try {
    const { session, lead, anonymousId } = await resolveSessionLeadForRequest(request, {
      anonymousId: parsed.data.anonymousId,
    });
    const stage = await upsertWishlistItem({
      sessionId: session.id,
      leadId: lead.id,
      productId: parsed.data.productId,
      collectionSlug: parsed.data.collectionSlug,
    });

    const response = NextResponse.json({
      ok: true,
      sessionRef: session.session_ref,
      leadRef: lead.lead_ref,
      stage,
    });

    return applyTrackingCookies(response, {
      anonymousId,
      sessionRef: session.session_ref,
      leadRef: lead.lead_ref,
    });
  } catch (error) {
    console.error("[api/wishlist][POST] failed", error);
    return jsonError("Unable to save to Wishlist.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return jsonError("Invalid wishlist payload.", 400);
  }

  const parsed = listMutationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid wishlist payload.", 400, {
      issues: parsed.error.flatten(),
    });
  }

  const rateLimit = applyRateLimit(`wishlist:${parsed.data.anonymousId}:${getRequestIp(request)}`, rateLimitOptions);

  if (!rateLimit.allowed) {
    return jsonError("Too many wishlist updates. Please try again shortly.", 429);
  }

  try {
    const { session, lead, anonymousId } = await resolveSessionLeadForRequest(request, {
      anonymousId: parsed.data.anonymousId,
    });

    await removeWishlistItem({
      sessionId: session.id,
      leadId: lead.id,
      productId: parsed.data.productId,
      collectionSlug: parsed.data.collectionSlug,
    });

    const response = NextResponse.json({
      ok: true,
      sessionRef: session.session_ref,
      leadRef: lead.lead_ref,
    });

    return applyTrackingCookies(response, {
      anonymousId,
      sessionRef: session.session_ref,
      leadRef: lead.lead_ref,
    });
  } catch (error) {
    console.error("[api/wishlist][DELETE] failed", error);
    return jsonError("Unable to update Wishlist.", 500);
  }
}
