"use client";

import { useEffect } from "react";

import posthog from "posthog-js";

import { publicEnv } from "@/lib/utils/public-env";

export const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if (!publicEnv.posthogKey) {
      return;
    }

    posthog.init(publicEnv.posthogKey, {
      api_host: publicEnv.posthogHost,
      capture_pageview: false,
      persistence: "localStorage+cookie",
      autocapture: false,
    });
  }, []);

  return <>{children}</>;
};
