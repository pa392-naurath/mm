import { NextResponse } from "next/server";

import { env } from "@/lib/utils/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    appEnv: env.appEnv,
    timestamp: new Date().toISOString(),
  });
}
