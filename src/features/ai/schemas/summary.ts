import { z } from "zod";

/** The structured company summary. All fields required; numeric bounds validated client-side. */
export const summarySchema = z.object({
  summary: z.string(),
  industry: z.string(),
  sizeEstimate: z.string(),
  techSignals: z.array(z.string()),
  hiringSignals: z.array(z.string()),
  relevanceScore: z.number().min(0).max(100),
});

export type CompanySummary = z.output<typeof summarySchema>;
