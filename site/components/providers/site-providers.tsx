"use client";

import { CommerceProvider } from "@/components/providers/commerce-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";

export const SiteProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <PostHogProvider>
      <CommerceProvider>{children}</CommerceProvider>
    </PostHogProvider>
  );
};
