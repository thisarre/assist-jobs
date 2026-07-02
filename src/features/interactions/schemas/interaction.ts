import { z } from "zod";
import { INTERACTION_TYPES, INTERACTION_DIRECTIONS } from "@/lib/constants";

export const interactionSchema = z.object({
  type: z.enum(INTERACTION_TYPES).default("note"),
  direction: z.enum(INTERACTION_DIRECTIONS).default("outbound"),
  content: z.string().min(1, "Content is required"),
});

export type InteractionFormData = z.output<typeof interactionSchema>;
export type InteractionFormValues = z.input<typeof interactionSchema>;
