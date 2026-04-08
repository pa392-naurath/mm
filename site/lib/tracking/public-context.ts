import { NextRequest } from "next/server";

import { getReferrerPath } from "@/lib/http/api";
import { getLeadBySessionId, getLeadByRef, getOrCreateLead, getOrCreateSession } from "@/lib/tracking/service";
import { trackingCookies } from "@/lib/tracking/cookies";

const getBrowserString = (request: NextRequest) =>
  request.headers.get("user-agent")?.slice(0, 120) ?? "unknown";

const getDeviceType = (request: NextRequest) => {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";

  if (/mobile|iphone|android/.test(userAgent)) {
    return "mobile";
  }

  if (/ipad|tablet/.test(userAgent)) {
    return "tablet";
  }

  return "desktop";
};

export const resolveSessionForRequest = async (
  request: NextRequest,
  input: {
    anonymousId: string;
    landingPage?: string;
    deviceType?: string | null;
    browser?: string | null;
    country?: string | null;
    city?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  },
) => {
  const cookieSessionRef = request.cookies.get(trackingCookies.session)?.value ?? null;
  const cookieAnonymousId = request.cookies.get(trackingCookies.anonymous)?.value ?? null;
  const anonymousId = cookieAnonymousId ?? input.anonymousId;

  const session = await getOrCreateSession({
    anonymousId,
    sessionRef: cookieSessionRef,
    landingPage: input.landingPage ?? getReferrerPath(request, "/"),
    deviceType: input.deviceType ?? getDeviceType(request),
    browser: input.browser ?? getBrowserString(request),
    country: input.country ?? null,
    city: input.city ?? null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    referrer: request.headers.get("referer") ?? null,
  });

  return { session, anonymousId };
};

export const resolveSessionLeadForRequest = async (
  request: NextRequest,
  input: {
    anonymousId: string;
    landingPage?: string;
    deviceType?: string | null;
    browser?: string | null;
    country?: string | null;
    city?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  },
) => {
  const { session, anonymousId } = await resolveSessionForRequest(request, input);
  const cookieLeadRef = request.cookies.get(trackingCookies.lead)?.value ?? null;
  const lead =
    (cookieLeadRef ? await getLeadByRef(cookieLeadRef) : null) ??
    (await getLeadBySessionId(session.id)) ??
    (await getOrCreateLead({
      sessionId: session.id,
      anonymousId,
      leadRef: cookieLeadRef,
    }));

  return { session, lead, anonymousId };
};
