import { z } from "zod";

/** The generated outreach message. subject is null for non-email message types. */
export const outreachSchema = z.object({
  subject: z.string().nullable(),
  body: z.string(),
  toneCheck: z.string(),
  personalizationNotes: z.string(),
});

export type Outreach = z.output<typeof outreachSchema>;
