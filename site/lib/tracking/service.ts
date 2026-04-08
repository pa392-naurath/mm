import { headers } from "next/headers";

import { getCollections, getProductById, getProductsByCollection } from "@/lib/content/data";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/utils/env";
import { buildLeadRefFromNumber, buildSessionRef } from "@/lib/utils/refs";
import { deriveLeadStage } from "@/lib/tracking/stages";
import type { LeadStage } from "@/types/domain";
import type {
  AdminLeadOverviewRow,
  DashboardSummaryRow,
  Json,
  LeadEventRow,
  LeadNoteRow,
  LeadRow,
  SelectionRow,
  SessionRow,
  WishlistRow,
} from "@/types/supabase";

const createAnonymousId = () => crypto.randomUUID();

const getClientIp = async () => {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
};

const getOrCreateAdminUser = async (authUserId: string, email: string) => {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("admin_users")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      auth_user_id: authUserId,
      email,
      name: email.split("@")[0],
      role: "admin",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const ensureAdminUser = async (authUserId: string, email: string) =>
  getOrCreateAdminUser(authUserId, email);

export const getOrCreateSession = async (payload: {
  anonymousId?: string | null;
  sessionRef?: string | null;
  landingPage: string;
  deviceType: string;
  browser: string;
  country?: string | null;
  city?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
}) => {
  const supabase = getSupabaseAdminClient();
  const anonymousId = payload.anonymousId || createAnonymousId();

  if (payload.sessionRef) {
    const { data: existing } = await supabase
      .from("visitor_sessions")
      .select("*")
      .eq("session_ref", payload.sessionRef)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from("visitor_sessions")
        .update({
          last_seen_at: new Date().toISOString(),
          anonymous_id: anonymousId,
          current_status: existing.current_status ?? "anonymous_visitor",
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return updated;
    }
  }

  const sessionRef = buildSessionRef();
  const { data, error } = await supabase
    .from("visitor_sessions")
    .insert({
      session_ref: sessionRef,
      anonymous_id: anonymousId,
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      landing_page: payload.landingPage,
      device_type: payload.deviceType,
      browser: payload.browser,
      country: payload.country ?? null,
      city: payload.city ?? null,
      utm_source: payload.utmSource ?? null,
      utm_medium: payload.utmMedium ?? null,
      utm_campaign: payload.utmCampaign ?? null,
      referrer: payload.referrer ?? null,
      current_status: "anonymous_visitor",
      ip_address_hint: await getClientIp(),
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getLeadByRef = async (leadRef: string) => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_profiles")
    .select("*")
    .eq("lead_ref", leadRef)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getLeadBySessionId = async (sessionId: string) => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_profiles")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getSessionByRef = async (sessionRef: string) => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("visitor_sessions")
    .select("*")
    .eq("session_ref", sessionRef)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const createLeadRecord = async (sessionId: string, anonymousId: string) => {
  const supabase = getSupabaseAdminClient();
  const { data: sequence, error: sequenceError } = await supabase.rpc("mm_next_lead_sequence");

  if (sequenceError) {
    throw sequenceError;
  }

  const leadRef = buildLeadRefFromNumber(Number(sequence));
  const { data, error } = await supabase
    .from("lead_profiles")
    .insert({
      lead_ref: leadRef,
      session_id: sessionId,
      anonymous_id: anonymousId,
      whatsapp_click_count: 0,
      source_channel: "web",
      stage: "anonymous_visitor",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getOrCreateLead = async (input: {
  sessionId: string;
  anonymousId: string;
  leadRef?: string | null;
}) => {
  const supabase = getSupabaseAdminClient();

  if (input.leadRef) {
    const existing = await getLeadByRef(input.leadRef);
    if (existing) {
      return existing;
    }
  }

  const { data: existingBySession } = await supabase
    .from("lead_profiles")
    .select("*")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (existingBySession) {
    return existingBySession;
  }

  return createLeadRecord(input.sessionId, input.anonymousId);
};

export const getOrCreateSessionLeadContext = async (input: {
  anonymousId: string;
  sessionRef?: string | null;
  leadRef?: string | null;
  landingPage?: string;
  deviceType?: string;
  browser?: string;
  country?: string | null;
  city?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
}) => {
  const session = await getOrCreateSession({
    anonymousId: input.anonymousId,
    sessionRef: input.sessionRef ?? null,
    landingPage: input.landingPage ?? "/",
    deviceType: input.deviceType ?? "unknown",
    browser: input.browser ?? "unknown",
    country: input.country ?? null,
    city: input.city ?? null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    referrer: input.referrer ?? null,
  });

  const lead = await getOrCreateLead({
    sessionId: session.id,
    anonymousId: input.anonymousId,
    leadRef: input.leadRef ?? null,
  });

  return { session, lead };
};

export const logLeadEvent = async (input: {
  sessionId: string;
  leadId?: string | null;
  eventName: string;
  eventSource: string;
  productId?: string | null;
  collectionSlug?: string | null;
  metadata?: Record<string, unknown>;
}) => {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("lead_events").insert({
    session_id: input.sessionId,
    lead_id: input.leadId ?? null,
    event_name: input.eventName,
    event_source: input.eventSource,
    product_id: input.productId ?? null,
    collection_slug: input.collectionSlug ?? null,
    metadata_json: (input.metadata ?? {}) as Json,
    occurred_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
};

const countListItems = async (table: "wishlists" | "selections", sessionId: string) => {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  if (error) {
    throw error;
  }

  return count ?? 0;
};

export const updateLeadStage = async (input: {
  leadId: string;
  sessionId: string;
  stage?: LeadStage | null;
  changedByAdminUserId?: string | null;
  reason?: string | null;
  whatsappClicked?: boolean;
  whatsappConfirmed?: boolean;
}) => {
  const supabase = getSupabaseAdminClient();
  const [wishlistCount, selectionCount] = await Promise.all([
    countListItems("wishlists", input.sessionId),
    countListItems("selections", input.sessionId),
  ]);

  const nextStage =
    input.stage ??
    deriveLeadStage({
      wishlistCount,
      selectionCount,
      whatsappClicked: Boolean(input.whatsappClicked),
      whatsappConfirmed: Boolean(input.whatsappConfirmed),
    });

  const { data: existing } = await supabase
    .from("lead_profiles")
    .select("stage")
    .eq("id", input.leadId)
    .single();

  const { error } = await supabase
    .from("lead_profiles")
    .update({
      stage: nextStage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.leadId);

  if (error) {
    throw error;
  }

  if (existing?.stage !== nextStage) {
    await supabase.from("lead_status_history").insert({
      lead_id: input.leadId,
      old_stage: existing?.stage ?? null,
      new_stage: nextStage,
      changed_by_admin_user_id: input.changedByAdminUserId ?? null,
      reason: input.reason ?? null,
      changed_at: new Date().toISOString(),
    });
  }

  return nextStage;
};

export const upsertWishlistItem = async (input: {
  sessionId: string;
  leadId: string;
  productId: string;
  collectionSlug: string;
}) => {
  const supabase = getSupabaseAdminClient();

  await supabase.from("wishlists").upsert(
    {
      session_id: input.sessionId,
      product_id: input.productId,
      added_at: new Date().toISOString(),
    },
    { onConflict: "session_id,product_id" },
  );

  await logLeadEvent({
    sessionId: input.sessionId,
    leadId: input.leadId,
    eventName: "add_to_wishlist",
    eventSource: "site",
    productId: input.productId,
    collectionSlug: input.collectionSlug,
  });

  return updateLeadStage({
    leadId: input.leadId,
    sessionId: input.sessionId,
  });
};

export const removeWishlistItem = async (input: {
  sessionId: string;
  leadId?: string | null;
  productId: string;
  collectionSlug?: string | null;
}) => {
  const supabase = getSupabaseAdminClient();
  await supabase.from("wishlists").delete().eq("session_id", input.sessionId).eq("product_id", input.productId);

  await logLeadEvent({
    sessionId: input.sessionId,
    leadId: input.leadId ?? null,
    eventName: "remove_from_wishlist",
    eventSource: "site",
    productId: input.productId,
    collectionSlug: input.collectionSlug ?? null,
  });
};

export const upsertSelectionItem = async (input: {
  sessionId: string;
  leadId: string;
  productId: string;
  collectionSlug: string;
  quantity: number;
}) => {
  const supabase = getSupabaseAdminClient();

  await supabase.from("selections").upsert(
    {
      session_id: input.sessionId,
      product_id: input.productId,
      quantity: input.quantity,
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,product_id" },
  );

  await logLeadEvent({
    sessionId: input.sessionId,
    leadId: input.leadId,
    eventName: "add_to_selections",
    eventSource: "site",
    productId: input.productId,
    collectionSlug: input.collectionSlug,
    metadata: { quantity: input.quantity },
  });

  return updateLeadStage({
    leadId: input.leadId,
    sessionId: input.sessionId,
  });
};

export const removeSelectionItem = async (input: {
  sessionId: string;
  leadId?: string | null;
  productId: string;
  collectionSlug?: string | null;
}) => {
  const supabase = getSupabaseAdminClient();
  await supabase.from("selections").delete().eq("session_id", input.sessionId).eq("product_id", input.productId);

  await logLeadEvent({
    sessionId: input.sessionId,
    leadId: input.leadId ?? null,
    eventName: "remove_from_selections",
    eventSource: "site",
    productId: input.productId,
    collectionSlug: input.collectionSlug ?? null,
  });
};

export const buildWhatsappPayload = async (input: {
  sessionId: string;
  anonymousId: string;
  leadRef?: string | null;
  productIds: string[];
  collectionSlug?: string | null;
  context: "intro" | "collection" | "selection" | "product";
}) => {
  const supabase = getSupabaseAdminClient();
  const lead = await getOrCreateLead({
    sessionId: input.sessionId,
    anonymousId: input.anonymousId,
    leadRef: input.leadRef,
  });

  const productEntries = await Promise.all(
    input.productIds.map(async (productId) => {
      const collectionCandidates = input.collectionSlug
        ? [input.collectionSlug]
        : (await getCollections()).map((collection) => collection.slug);

      for (const slug of collectionCandidates) {
        const product = await getProductById(slug, productId);
        if (product) {
          return product;
        }
      }

      return null;
    }),
  );

  const products = productEntries.filter(Boolean);
  const lines =
    products.length > 0
      ? products.map(
          (product, index) =>
            `${index + 1}. ${product!.whatsappLabel}${product!.variant ? ` — ${product!.variant}` : ""}`,
        )
      : [];

  const opener =
    input.context === "intro"
      ? env.whatsappPrefill
      : "Hello, I would like to enquire about the following pieces:";

  const message = [opener, "", ...lines, "", `Lead Reference: ${lead.lead_ref}`, "", "Kindly assist."]
    .filter(Boolean)
    .join("\n");

  await supabase
    .from("lead_profiles")
    .update({
      whatsapp_click_count: (lead.whatsapp_click_count ?? 0) + 1,
      whatsapp_first_clicked_at: lead.whatsapp_first_clicked_at ?? new Date().toISOString(),
      whatsapp_last_clicked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id);

  await logLeadEvent({
    sessionId: input.sessionId,
    leadId: lead.id,
    eventName: input.context === "intro" ? "connect_whatsapp_clicked" : "whatsapp_cta_clicked",
    eventSource: "site",
    collectionSlug: input.collectionSlug ?? null,
    metadata: {
      productIds: input.productIds,
      context: input.context,
      leadRef: lead.lead_ref,
    },
  });

  await updateLeadStage({
    leadId: lead.id,
    sessionId: input.sessionId,
    whatsappClicked: true,
  });

  await captureServerEvent(lead.anonymous_id, "whatsapp_cta_clicked", {
    anonymous_id: lead.anonymous_id,
    session_ref: (await supabase.from("visitor_sessions").select("session_ref").eq("id", input.sessionId).single())
      .data?.session_ref,
    lead_ref: lead.lead_ref,
    current_stage: "whatsapp_clicked",
    collection_slug: input.collectionSlug ?? null,
    page_path: input.context,
  });

  return {
    leadRef: lead.lead_ref,
    message,
    href: `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`,
  };
};

export const markWhatsappConfirmed = async (input: {
  leadRef: string;
  changedByAdminUserId: string;
  confirmedAt?: string | null;
  reason?: string | null;
}) => {
  const supabase = getSupabaseAdminClient();
  const lead = await getLeadByRef(input.leadRef);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  await supabase
    .from("lead_profiles")
    .update({
      whatsapp_confirmed_at: input.confirmedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id);

  await updateLeadStage({
    leadId: lead.id,
    sessionId: lead.session_id,
    stage: "whatsapp_confirmed",
    changedByAdminUserId: input.changedByAdminUserId,
    reason: input.reason ?? "Inbound WhatsApp reconciled manually.",
    whatsappConfirmed: true,
  });

  return lead;
};

export const addLeadNote = async (input: {
  leadRef: string;
  note: string;
  adminUserId: string;
}) => {
  const supabase = getSupabaseAdminClient();
  const lead = await getLeadByRef(input.leadRef);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const { error } = await supabase.from("lead_notes").insert({
    lead_id: lead.id,
    note: input.note,
    created_by_admin_user_id: input.adminUserId,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  await logLeadEvent({
    sessionId: lead.session_id,
    leadId: lead.id,
    eventName: "admin_lead_updated",
    eventSource: "admin",
    metadata: { action: "note_added" },
  });
};

export const getDashboardAggregates = async () => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("admin_dashboard_summary").select("*").single();

  if (error) {
    throw error;
  }

  return data as DashboardSummaryRow;
};

export const getLeadTableRows = async () => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_lead_overview")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminLeadOverviewRow[];
};

export const getSessionTableRows = async () => {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("visitor_sessions")
    .select("*")
    .order("last_seen_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SessionRow[];
};

export const getLeadDetail = async (leadRef: string) => {
  const supabase = getSupabaseAdminClient();
  const lead = await getLeadByRef(leadRef);

  if (!lead) {
    return null;
  }

  const [{ data: session }, { data: events }, { data: notes }, { data: wishlists }, { data: selections }] =
    await Promise.all([
      supabase.from("visitor_sessions").select("*").eq("id", lead.session_id).single(),
      supabase.from("lead_events").select("*").eq("lead_id", lead.id).order("occurred_at", { ascending: false }),
      supabase.from("lead_notes").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
      supabase.from("wishlists").select("*").eq("session_id", lead.session_id),
      supabase.from("selections").select("*").eq("session_id", lead.session_id),
    ]);

  return {
    lead: lead as LeadRow,
    session: (session ?? null) as SessionRow | null,
    events: (events ?? []) as LeadEventRow[],
    notes: (notes ?? []) as LeadNoteRow[],
    wishlists: (wishlists ?? []) as WishlistRow[],
    selections: (selections ?? []) as SelectionRow[],
  };
};

export const updateLeadStageByRef = async (input: {
  leadRef: string;
  stage: LeadStage;
  changedByAdminUserId: string;
  reason?: string | null;
}) => {
  const lead = await getLeadByRef(input.leadRef);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  return updateLeadStage({
    leadId: lead.id,
    sessionId: lead.session_id,
    stage: input.stage,
    changedByAdminUserId: input.changedByAdminUserId,
    reason: input.reason ?? null,
  });
};

export const getCollectionProductsForSlug = async (slug: string) => getProductsByCollection(slug);
