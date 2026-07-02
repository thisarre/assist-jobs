"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { ownsEntity } from "@/lib/ownership";
import { entityDetailPath } from "@/lib/entities";
import { db } from "@/db/client";
import { tags, taggables } from "@/db/schema";
import { tagSchema } from "@/features/tags/schemas/tag";
import type { EntityType } from "@/types";

type ActionResult =
  | { success: true; id: string }
  | { error: string | Record<string, string[] | undefined> };

/**
 * Find-or-create a tag by (user, name), then assign it to the entity.
 * Reusing an existing name re-uses the tag (no duplicates thanks to the
 * (user_id, name) unique index and the taggables unique index).
 */
export async function createAndAssignTag(
  name: string,
  entityType: EntityType,
  entityId: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = tagSchema.safeParse({ name });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const tagName = parsed.data.name;

  if (!(await ownsEntity(user.id, entityType, entityId))) {
    return { error: "Not found" };
  }

  // Find-or-create (race-safe via onConflictDoNothing on the unique index).
  await db
    .insert(tags)
    .values({ userId: user.id, name: tagName })
    .onConflictDoNothing();

  const [tag] = await db
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.userId, user.id), eq(tags.name, tagName)))
    .limit(1);

  if (!tag) return { error: "Failed to create tag" };

  await db
    .insert(taggables)
    .values({ tagId: tag.id, taggableId: entityId, taggableType: entityType })
    .onConflictDoNothing();

  revalidatePath(entityDetailPath(entityType, entityId));
  return { success: true, id: tag.id };
}

export async function unassignTag(
  tagId: string,
  entityType: EntityType,
  entityId: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  // The tag must belong to the user (taggables has no user_id of its own).
  const [tag] = await db
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, user.id)))
    .limit(1);

  if (!tag) return { error: "Not found" };

  await db
    .delete(taggables)
    .where(
      and(
        eq(taggables.tagId, tagId),
        eq(taggables.taggableId, entityId),
        eq(taggables.taggableType, entityType)
      )
    );

  revalidatePath(entityDetailPath(entityType, entityId));
  return { success: true, id: tagId };
}
