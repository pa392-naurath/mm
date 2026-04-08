import type { LeadStage } from "@/types/domain";

export const deriveLeadStage = (input: {
  wishlistCount: number;
  selectionCount: number;
  whatsappClicked: boolean;
  whatsappConfirmed: boolean;
  currentStage?: LeadStage | null;
}): LeadStage => {
  if (input.whatsappConfirmed) {
    return "whatsapp_confirmed";
  }

  if (input.whatsappClicked) {
    return "whatsapp_clicked";
  }

  if (input.selectionCount > 0) {
    return "selection_started";
  }

  if (input.wishlistCount > 0) {
    return "wishlist_only";
  }

  return input.currentStage ?? "anonymous_visitor";
};
