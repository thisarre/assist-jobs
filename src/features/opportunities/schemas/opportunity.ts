import { z } from "zod";
import {
  OPPORTUNITY_STATUSES,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_SOURCES,
  REMOTE_POLICIES,
  LANGUAGES,
} from "@/lib/constants";

export const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  // "" means "none" (stored as NULL by the action).
  companyId: z.string().default(""),
  contactId: z.string().default(""),
  // Optional enums: "" means "not set".
  source: z.union([z.enum(OPPORTUNITY_SOURCES), z.literal("")]).default(""),
  remotePolicy: z.union([z.enum(REMOTE_POLICIES), z.literal("")]).default(""),
  status: z.enum(OPPORTUNITY_STATUSES).default("detected"),
  priority: z.enum(OPPORTUNITY_PRIORITIES).default("medium"),
  probability: z.number().min(0, "0-100").max(100, "0-100").default(0),
  dailyRate: z.number().min(0, "Must be positive").default(0),
  location: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  description: z.string().default(""),
  notes: z.string().default(""),
  language: z.enum(LANGUAGES).default("fr"),
  nextAction: z.string().default(""),
  nextFollowupAt: z.string().default(""),
});

export type OpportunityFormData = z.output<typeof opportunitySchema>;
export type OpportunityFormValues = z.input<typeof opportunitySchema>;
