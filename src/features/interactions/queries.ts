import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { interactions } from "@/db/schema";
import type { EntityType } from "@/types";
import type { TimelineItem } from "@/features/interactions/components/interaction-timeline";

/** Load a user's interactions for one entity, newest first. */
export async function loadInteractions(
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<TimelineItem[]> {
  const column =
    entityType === "company"
      ? interactions.companyId
      : entityType === "contact"
        ? interactions.contactId
        : interactions.opportunityId;

  return db
    .select({
      id: interactions.id,
      type: interactions.type,
      direction: interactions.direction,
      content: interactions.content,
      createdAt: interactions.createdAt,
    })
    .from(interactions)
    .where(and(eq(column, entityId), eq(interactions.userId, userId)))
    .orderBy(desc(interactions.createdAt));
}
