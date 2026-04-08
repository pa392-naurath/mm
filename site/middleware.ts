import { NextResponse, type NextRequest } from "next/server";

const isLocalHost = (host: string) =>
  host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("0.0.0.0");

const isVercelPreviewHost = (host: string) => host.endsWith(".vercel.app");

export function middleware(request: NextRequest) {
  const canonicalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const requestHost = request.headers.get("host") ?? "";

  if (!canonicalSiteUrl || appEnv !== "production" || !requestHost) {
    return NextResponse.next();
  }

  if (isLocalHost(requestHost) || isVercelPreviewHost(requestHost)) {
    return NextResponse.next();
  }

  const canonicalUrl = new URL(canonicalSiteUrl);

  if (requestHost !== canonicalUrl.host) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = canonicalUrl.protocol;
    redirectUrl.host = canonicalUrl.host;

    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
