import { pgTable, uuid, text, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("tags_user_id_name_idx").on(table.userId, table.name),
  ]
);

export const taggables = pgTable(
  "taggables",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    taggableId: uuid("taggable_id").notNull(),
    taggableType: text("taggable_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("taggables_unique_idx").on(
      table.tagId,
      table.taggableId,
      table.taggableType
    ),
    index("taggables_taggable_idx").on(table.taggableId, table.taggableType),
  ]
);
