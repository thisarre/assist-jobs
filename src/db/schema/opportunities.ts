import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { companies } from "./companies";
import { contacts } from "./contacts";

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    source: text("source"),
    status: text("status").notNull().default("detected"),
    priority: text("priority").notNull().default("medium"),
    probability: integer("probability"),
    dailyRate: integer("daily_rate"),
    location: text("location"),
    remotePolicy: text("remote_policy"),
    technologies: text("technologies").array().default([]),
    description: text("description"),
    notes: text("notes"),
    language: text("language").notNull().default("fr"),
    nextAction: text("next_action"),
    nextFollowupAt: timestamp("next_followup_at", { withTimezone: true }),
    lastInteractionAt: timestamp("last_interaction_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("opportunities_user_id_idx").on(table.userId),
    index("opportunities_status_idx").on(table.status),
    index("opportunities_company_id_idx").on(table.companyId),
    index("opportunities_next_followup_idx").on(table.nextFollowupAt),
  ]
);
