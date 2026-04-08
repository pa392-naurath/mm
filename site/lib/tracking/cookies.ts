import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "mm_session_ref";
const ANON_COOKIE = "mm_anon_id";
const LEAD_COOKIE = "mm_lead_ref";

export const trackingCookies = {
  session: SESSION_COOKIE,
  anonymous: ANON_COOKIE,
  lead: LEAD_COOKIE,
};

export const readTrackingCookies = async () => {
  const cookieStore = await cookies();

  return {
    sessionRef: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    anonymousId: cookieStore.get(ANON_COOKIE)?.value ?? null,
    leadRef: cookieStore.get(LEAD_COOKIE)?.value ?? null,
  };
};

const baseCookieOptions = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 90,
};

export const applyTrackingCookies = (
  response: NextResponse,
  input: {
    sessionRef?: string | null;
    anonymousId?: string | null;
    leadRef?: string | null;
  },
) => {
  if (input.sessionRef) {
    response.cookies.set(SESSION_COOKIE, input.sessionRef, baseCookieOptions);
  }

  if (input.anonymousId) {
    response.cookies.set(ANON_COOKIE, input.anonymousId, baseCookieOptions);
  }

  if (input.leadRef) {
    response.cookies.set(LEAD_COOKIE, input.leadRef, baseCookieOptions);
  }

  return response;
};
