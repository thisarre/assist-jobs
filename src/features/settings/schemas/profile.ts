import { z } from "zod";
import { REMOTE_POLICIES, LANGUAGES } from "@/lib/constants";

export const profileSchema = z.object({
  bio: z.string().default(""),
  role: z.string().min(1, "Role is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  preferredStack: z.array(z.string()).default([]),
  targetDailyRate: z.number().min(0, "Daily rate must be positive").default(0),
  preferredRemote: z.enum(REMOTE_POLICIES).default("remote"),
  preferredLocation: z.string().default(""),
  targetClients: z.string().default(""),
  yearsExperience: z.number().min(0, "Experience must be positive").default(0),
  languages: z
    .array(z.enum(LANGUAGES))
    .min(1)
    .default(["fr"]),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
