import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    website: text("website"),
    linkedinUrl: text("linkedin_url"),
    industry: text("industry"),
    size: text("size"),
    location: text("location"),
    technologies: text("technologies").array().default([]),
    hiringSignals: text("hiring_signals"),
    notes: text("notes"),
    relationshipStatus: text("relationship_status").notNull().default("cold"),
    score: integer("score"),
    lastInteractionAt: timestamp("last_interaction_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("companies_user_id_idx").on(table.userId),
    index("companies_name_idx").on(table.name),
  ]
);
