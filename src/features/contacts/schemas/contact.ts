import { z } from "zod";
import { RELATIONSHIP_STRENGTHS, LANGUAGES } from "@/lib/constants";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // "" means "no company" (stored as NULL by the action).
  companyId: z.string().default(""),
  role: z.string().default(""),
  linkedinUrl: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  language: z.enum(LANGUAGES).default("fr"),
  relationshipStrength: z.enum(RELATIONSHIP_STRENGTHS).default("unknown"),
  notes: z.string().default(""),
  // "yyyy-mm-dd" or "" (converted to a Date / NULL by the action).
  nextFollowupAt: z.string().default(""),
});

export type ContactFormData = z.output<typeof contactSchema>;
export type ContactFormValues = z.input<typeof contactSchema>;
