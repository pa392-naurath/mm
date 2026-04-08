import { NextRequest, NextResponse } from "next/server";

export const getRequestIp = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

export const jsonError = (
  message: string,
  status: number,
  extra: Record<string, unknown> = {},
) =>
  NextResponse.json(
    {
      message,
      ...extra,
    },
    { status },
  );

export const getReferrerPath = (request: NextRequest, fallback = "/") => {
  const referrer = request.headers.get("referer");

  if (!referrer) {
    return fallback;
  }

  try {
    const url = new URL(referrer);
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
};
