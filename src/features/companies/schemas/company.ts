import { z } from "zod";
import { COMPANY_SIZES, RELATIONSHIP_STATUSES } from "@/lib/constants";

export const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().default(""),
  linkedinUrl: z.string().default(""),
  industry: z.string().default(""),
  // Optional enum: "" means "not set" (stored as NULL by the action).
  size: z.union([z.enum(COMPANY_SIZES), z.literal("")]).default(""),
  location: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  hiringSignals: z.string().default(""),
  notes: z.string().default(""),
  relationshipStatus: z.enum(RELATIONSHIP_STATUSES).default("cold"),
  score: z.number().min(0, "Score must be 0-100").max(100, "Score must be 0-100").default(0),
});

// Output type: all fields present after defaults (parsed/stored data).
export type CompanyFormData = z.output<typeof companySchema>;
// Input type: fields with defaults are optional (form field values).
export type CompanyFormValues = z.input<typeof companySchema>;
