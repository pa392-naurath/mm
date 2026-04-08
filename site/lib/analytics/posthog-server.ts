import { PostHog } from "posthog-node";

import { env } from "@/lib/utils/env";

let client: PostHog | null = null;

export const getPostHogServer = () => {
  if (!env.posthogKey) {
    return null;
  }

  if (!client) {
    client = new PostHog(env.posthogKey, {
      host: env.posthogHost,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return client;
};

export const captureServerEvent = async (
  distinctId: string,
  event: string,
  properties: Record<string, unknown>,
) => {
  const posthog = getPostHogServer();

  if (!posthog) {
    return;
  }

  posthog.capture({
    distinctId,
    event,
    properties,
  });

  await posthog.shutdown();
  client = null;
};
