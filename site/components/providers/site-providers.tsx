"use client";

import { CommerceProvider } from "@/components/providers/commerce-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { RouteBodyClasses } from "@/components/providers/route-body-classes";

export const SiteProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <PostHogProvider>
      <CommerceProvider>
        <RouteBodyClasses />
        {children}
      </CommerceProvider>
    </PostHogProvider>
  );
};
