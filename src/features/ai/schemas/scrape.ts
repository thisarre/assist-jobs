import { z } from "zod";

export const scrapeInputSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid URL (https://…)")
    .refine((v) => /^https?:\/\//i.test(v), "Enter a valid URL (https://…)"),
});

export type ScrapeInput = z.infer<typeof scrapeInputSchema>;
