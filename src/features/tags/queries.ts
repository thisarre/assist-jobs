import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tags, taggables } from "@/db/schema";
import type { EntityType } from "@/types";
import type { AssignedTag } from "@/features/tags/components/tag-manager";

/** Load the tags assigned to one entity, scoped to the user's own tags. */
export async function loadAssignedTags(
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<AssignedTag[]> {
  return db
    .select({ id: tags.id, name: tags.name })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(
      and(
        eq(taggables.taggableId, entityId),
        eq(taggables.taggableType, entityType),
        eq(tags.userId, userId)
      )
    )
    .orderBy(asc(tags.name));
}
