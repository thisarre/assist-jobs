import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { opportunities } from "./opportunities";
import { companies } from "./companies";
import { contacts } from "./contacts";

export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id, {
      onDelete: "set null",
    }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(),
    inputText: text("input_text").notNull(),
    promptKey: text("prompt_key").notNull(),
    output: jsonb("output").notNull(),
    model: text("model").notNull(),
    tokensUsed: integer("tokens_used"),
    status: text("status").notNull().default("generated"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ai_generations_user_id_idx").on(table.userId),
    index("ai_generations_type_idx").on(table.type),
  ]
);
