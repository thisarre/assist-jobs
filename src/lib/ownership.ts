import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companies, contacts, opportunities } from "@/db/schema";
import type { EntityType } from "@/types";

/**
 * Validates that a foreign-key id submitted from a form actually belongs to the
 * current user. The relevant <select> only offers the user's own rows, but server
 * actions must not trust client input — a crafted submission could otherwise link
 * an entity to another user's company/contact. Returns the id if owned, else null.
 * The Drizzle client bypasses RLS, so this app-level check is the only guard.
 */
export async function ownedCompanyId(
  userId: string,
  id: string | null
): Promise<string | null> {
  if (!id) return null;
  const [row] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.userId, userId)))
    .limit(1);
  return row?.id ?? null;
}

/** Returns the contact id if it belongs to the user, else null. See ownedCompanyId. */
export async function ownedContactId(
  userId: string,
  id: string | null
): Promise<string | null> {
  if (!id) return null;
  const [row] = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, userId)))
    .limit(1);
  return row?.id ?? null;
}

/** Returns the opportunity id if it belongs to the user, else null. See ownedCompanyId. */
export async function ownedOpportunityId(
  userId: string,
  id: string | null
): Promise<string | null> {
  if (!id) return null;
  const [row] = await db
    .select({ id: opportunities.id })
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.userId, userId)))
    .limit(1);
  return row?.id ?? null;
}

/** True if the given entity (of entityType) belongs to the user. */
export async function ownsEntity(
  userId: string,
  entityType: EntityType,
  entityId: string
): Promise<boolean> {
  if (entityType === "company") return (await ownedCompanyId(userId, entityId)) !== null;
  if (entityType === "contact") return (await ownedContactId(userId, entityId)) !== null;
  return (await ownedOpportunityId(userId, entityId)) !== null;
}
