import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(40, "Tag name too long"),
});

export type TagFormData = z.output<typeof tagSchema>;
