import type { LeadStage } from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      visitor_sessions: {
        Row: {
          id: string;
          session_ref: string;
          anonymous_id: string;
          first_seen_at: string;
          last_seen_at: string;
          landing_page: string;
          device_type: string;
          browser: string;
          country: string | null;
          city: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          referrer: string | null;
          current_status: LeadStage;
          ip_address_hint: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_ref: string;
          anonymous_id: string;
          first_seen_at?: string;
          last_seen_at?: string;
          landing_page: string;
          device_type: string;
          browser: string;
          country?: string | null;
          city?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          referrer?: string | null;
          current_status?: LeadStage;
          ip_address_hint?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["visitor_sessions"]["Insert"]>;
        Relationships: [];
      };
      lead_profiles: {
        Row: {
          id: string;
          lead_ref: string;
          session_id: string;
          anonymous_id: string;
          whatsapp_click_count: number;
          whatsapp_first_clicked_at: string | null;
          whatsapp_last_clicked_at: string | null;
          whatsapp_confirmed_at: string | null;
          source_channel: string;
          stage: LeadStage;
          notes_internal: string | null;
          assigned_to_admin_user: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_ref: string;
          session_id: string;
          anonymous_id: string;
          whatsapp_click_count?: number;
          whatsapp_first_clicked_at?: string | null;
          whatsapp_last_clicked_at?: string | null;
          whatsapp_confirmed_at?: string | null;
          source_channel?: string;
          stage?: LeadStage;
          notes_internal?: string | null;
          assigned_to_admin_user?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_profiles"]["Insert"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          auth_user_id: string;
          name: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          name: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };
      wishlists: {
        Row: {
          id: string;
          session_id: string;
          product_id: string;
          added_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          product_id: string;
          added_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlists"]["Insert"]>;
        Relationships: [];
      };
      selections: {
        Row: {
          id: string;
          session_id: string;
          product_id: string;
          quantity: number;
          added_at: string;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          product_id: string;
          quantity?: number;
          added_at?: string;
          updated_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["selections"]["Insert"]>;
        Relationships: [];
      };
      lead_events: {
        Row: {
          id: string;
          session_id: string;
          lead_id: string | null;
          event_name: string;
          event_source: string;
          product_id: string | null;
          collection_slug: string | null;
          metadata_json: Json;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          lead_id?: string | null;
          event_name: string;
          event_source: string;
          product_id?: string | null;
          collection_slug?: string | null;
          metadata_json?: Json;
          occurred_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_events"]["Insert"]>;
        Relationships: [];
      };
      lead_status_history: {
        Row: {
          id: string;
          lead_id: string;
          old_stage: LeadStage | null;
          new_stage: LeadStage;
          changed_by_admin_user_id: string | null;
          reason: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          old_stage?: LeadStage | null;
          new_stage: LeadStage;
          changed_by_admin_user_id?: string | null;
          reason?: string | null;
          changed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_status_history"]["Insert"]>;
        Relationships: [];
      };
      lead_notes: {
        Row: {
          id: string;
          lead_id: string;
          note: string;
          created_by_admin_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          note: string;
          created_by_admin_user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_notes"]["Insert"]>;
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: string;
          session_id: string | null;
          lead_id: string | null;
          name: string;
          contact: string;
          email: string;
          location: string;
          inquiry_note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          lead_id?: string | null;
          name: string;
          contact: string;
          email: string;
          location: string;
          inquiry_note: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_inquiries"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      admin_lead_overview: {
        Row: {
          id: string;
          lead_ref: string;
          session_ref: string;
          stage: LeadStage;
          whatsapp_click_count: number;
          created_at: string;
          last_seen_at: string;
          utm_source: string | null;
          utm_campaign: string | null;
          country: string | null;
          assigned_to: string | null;
          wishlist_count: number;
          selection_count: number;
        };
        Relationships: [];
      };
      admin_dashboard_summary: {
        Row: {
          total_sessions: number;
          total_leads: number;
          wishlist_only: number;
          selection_started: number;
          whatsapp_clicked: number;
          whatsapp_confirmed: number;
          closed_won: number;
          stale_leads: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      mm_next_lead_sequence: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
  };
}

export type SessionRow = Database["public"]["Tables"]["visitor_sessions"]["Row"];
export type LeadRow = Database["public"]["Tables"]["lead_profiles"]["Row"];
export type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];
export type WishlistRow = Database["public"]["Tables"]["wishlists"]["Row"];
export type SelectionRow = Database["public"]["Tables"]["selections"]["Row"];
export type LeadEventRow = Database["public"]["Tables"]["lead_events"]["Row"];
export type LeadNoteRow = Database["public"]["Tables"]["lead_notes"]["Row"];
export type ContactInquiryRow = Database["public"]["Tables"]["contact_inquiries"]["Row"];
export type AdminLeadOverviewRow = Database["public"]["Views"]["admin_lead_overview"]["Row"];
export type DashboardSummaryRow = Database["public"]["Views"]["admin_dashboard_summary"]["Row"];
