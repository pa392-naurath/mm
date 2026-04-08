export type LeadStage =
  | "anonymous_visitor"
  | "wishlist_only"
  | "selection_started"
  | "whatsapp_clicked"
  | "whatsapp_confirmed"
  | "qualified"
  | "closed_won"
  | "closed_lost";

export interface CollectionContent {
  slug: string;
  order: number;
  title: string;
  label: string;
  story: string;
  heroImageDesktop: string;
  heroImageMobile: string;
  heroObjectPositionDesktop: string;
  heroObjectPositionMobile: string;
  textAlign: "left" | "right";
}

export interface ProductContent {
  id: string;
  collectionSlug: string;
  name: string;
  variant: string;
  price: number;
  currency: string;
  story: string;
  description: string;
  material: string;
  dimensions: string;
  lifestyleImage: string;
  studioImage: string;
  whatsappLabel: string;
  status: string;
  order: number;
}

export interface SessionContext {
  id: string;
  sessionRef: string;
  anonymousId: string;
  leadRef?: string | null;
  stage: LeadStage;
}

export interface DashboardAggregate {
  totalSessions: number;
  totalLeads: number;
  wishlistOnly: number;
  selectionStarted: number;
  whatsappClicked: number;
  whatsappConfirmed: number;
  closedWon: number;
  staleLeads: number;
}
