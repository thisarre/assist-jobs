import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  profile: jsonb("profile").$type<UserProfile>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserProfile = {
  bio: string;
  role: string;
  skills: string[];
  preferredStack: string[];
  targetDailyRate: number;
  preferredRemote: string;
  preferredLocation: string;
  targetClients: string;
  yearsExperience: number;
  languages: string[];
};
