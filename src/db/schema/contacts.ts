import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { companies } from "./companies";

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    role: text("role"),
    linkedinUrl: text("linkedin_url"),
    email: text("email"),
    phone: text("phone"),
    language: text("language").notNull().default("fr"),
    relationshipStrength: text("relationship_strength").notNull().default("unknown"),
    notes: text("notes"),
    lastInteractionAt: timestamp("last_interaction_at", { withTimezone: true }),
    nextFollowupAt: timestamp("next_followup_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("contacts_user_id_idx").on(table.userId),
    index("contacts_company_id_idx").on(table.companyId),
  ]
);
