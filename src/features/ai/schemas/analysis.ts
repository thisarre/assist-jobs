import { z } from "zod";

/**
 * The structured extraction the Analyzer produces. All fields are required (native
 * structured outputs need every property present); estimatedDailyRate may be null.
 * Numeric bounds on matchScore are validated by the SDK client-side.
 */
export const analysisSchema = z.object({
  companyName: z.string(),
  role: z.string(),
  technologies: z.array(z.string()),
  seniority: z.string(),
  location: z.string(),
  remotePolicy: z.string(),
  estimatedDailyRate: z.number().min(0).nullable(),
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendedAction: z.string(),
  explanation: z.string(),
});

export type Analysis = z.output<typeof analysisSchema>;
