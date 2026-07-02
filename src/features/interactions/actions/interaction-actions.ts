"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { ownsEntity } from "@/lib/ownership";
import { entityDetailPath } from "@/lib/entities";
import { db } from "@/db/client";
import { interactions, companies, contacts, opportunities } from "@/db/schema";
import { interactionSchema } from "@/features/interactions/schemas/interaction";
import { ENTITY_TYPES } from "@/lib/constants";
import type { EntityType } from "@/types";

type ActionResult =
  | { success: true; id: string }
  | { error: string | Record<string, string[] | undefined> };

export async function addInteraction(
  entityType: EntityType,
  entityId: string,
  input: unknown
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  if (!(ENTITY_TYPES as readonly string[]).includes(entityType)) {
    return { error: "Invalid entity type" };
  }

  // Multi-tenancy: the parent entity must belong to the user (Drizzle bypasses RLS).
  if (!(await ownsEntity(user.id, entityType, entityId))) {
    return { error: "Not found" };
  }

  const parsed = interactionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  await db.insert(interactions).values({
    userId: user.id,
    companyId: entityType === "company" ? entityId : null,
    contactId: entityType === "contact" ? entityId : null,
    opportunityId: entityType === "opportunity" ? entityId : null,
    type: v.type,
    direction: v.direction,
    content: v.content,
  });

  // Bump the parent's last_interaction_at.
  const now = new Date();
  if (entityType === "company") {
    await db
      .update(companies)
      .set({ lastInteractionAt: now })
      .where(and(eq(companies.id, entityId), eq(companies.userId, user.id)));
  } else if (entityType === "contact") {
    await db
      .update(contacts)
      .set({ lastInteractionAt: now })
      .where(and(eq(contacts.id, entityId), eq(contacts.userId, user.id)));
  } else {
    await db
      .update(opportunities)
      .set({ lastInteractionAt: now })
      .where(and(eq(opportunities.id, entityId), eq(opportunities.userId, user.id)));
  }

  revalidatePath(entityDetailPath(entityType, entityId));
  return { success: true, id: entityId };
}
