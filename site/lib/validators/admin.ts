import { z } from "zod";

export const leadStageUpdateSchema = z.object({
  newStage: z.enum([
    "anonymous_visitor",
    "wishlist_only",
    "selection_started",
    "whatsapp_clicked",
    "whatsapp_confirmed",
    "qualified",
    "closed_won",
    "closed_lost",
  ]),
  reason: z.string().max(500).optional().nullable(),
});

export const leadNoteSchema = z.object({
  note: z.string().min(2).max(2000),
});

export const confirmWhatsappSchema = z.object({
  confirmedAt: z.string().datetime().optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
});
