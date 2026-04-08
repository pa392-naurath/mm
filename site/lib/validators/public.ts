import { z } from "zod";

export const sessionSchema = z.object({
  anonymousId: z.string().min(8).max(128),
  landingPage: z.string().min(1).max(512),
  deviceType: z.string().min(1).max(32),
  browser: z.string().min(1).max(120),
  country: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  utmSource: z.string().max(120).optional().nullable(),
  utmMedium: z.string().max(120).optional().nullable(),
  utmCampaign: z.string().max(180).optional().nullable(),
  referrer: z.string().max(512).optional().nullable(),
});

export const listMutationSchema = z.object({
  productId: z.string().min(1).max(64),
  collectionSlug: z.string().min(1).max(64),
  anonymousId: z.string().min(8).max(128),
  quantity: z.number().int().min(1).max(10).optional(),
});

export const eventSchema = z.object({
  anonymousId: z.string().min(8).max(128),
  sessionRef: z.string().min(6).max(32).optional().nullable(),
  leadRef: z.string().min(6).max(32).optional().nullable(),
  eventName: z.string().min(1).max(120),
  eventSource: z.string().min(1).max(120),
  productId: z.string().max(64).optional().nullable(),
  collectionSlug: z.string().max(64).optional().nullable(),
  pagePath: z.string().max(512).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const whatsappPayloadSchema = z.object({
  anonymousId: z.string().min(8).max(128),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(64),
      }),
    )
    .default([]),
  context: z.enum(["intro", "collection", "selection", "product"]).default("selection"),
  collectionSlug: z.string().max(64).optional().nullable(),
});

export const contactInquirySchema = z.object({
  name: z.string().min(2).max(120),
  contact: z.string().min(6).max(120),
  email: z.string().email().max(180),
  location: z.string().min(2).max(120),
  note: z.string().min(10).max(2000),
  anonymousId: z.string().min(8).max(128),
});
