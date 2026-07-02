"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { opportunities } from "@/db/schema";
import { emptyToNull, parseDateInput } from "@/lib/forms";
import { opportunitySchema } from "@/features/opportunities/schemas/opportunity";

type ActionResult =
  | { success: true; id: string }
  | { error: string | Record<string, string[] | undefined> };

export async function createOpportunity(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const [row] = await db
    .insert(opportunities)
    .values({
      userId: user.id,
      companyId: emptyToNull(v.companyId),
      contactId: emptyToNull(v.contactId),
      title: v.title,
      source: emptyToNull(v.source),
      status: v.status,
      priority: v.priority,
      probability: v.probability,
      dailyRate: v.dailyRate,
      location: emptyToNull(v.location),
      remotePolicy: emptyToNull(v.remotePolicy),
      technologies: v.technologies,
      description: emptyToNull(v.description),
      notes: emptyToNull(v.notes),
      language: v.language,
      nextAction: emptyToNull(v.nextAction),
      nextFollowupAt: parseDateInput(v.nextFollowupAt),
    })
    .returning({ id: opportunities.id });

  revalidatePath("/opportunities");
  return { success: true, id: row.id };
}

export async function updateOpportunity(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  await db
    .update(opportunities)
    .set({
      companyId: emptyToNull(v.companyId),
      contactId: emptyToNull(v.contactId),
      title: v.title,
      source: emptyToNull(v.source),
      status: v.status,
      priority: v.priority,
      probability: v.probability,
      dailyRate: v.dailyRate,
      location: emptyToNull(v.location),
      remotePolicy: emptyToNull(v.remotePolicy),
      technologies: v.technologies,
      description: emptyToNull(v.description),
      notes: emptyToNull(v.notes),
      language: v.language,
      nextAction: emptyToNull(v.nextAction),
      nextFollowupAt: parseDateInput(v.nextFollowupAt),
      updatedAt: new Date(),
    })
    .where(and(eq(opportunities.id, id), eq(opportunities.userId, user.id)));

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${id}`);
  return { success: true, id };
}

export async function deleteOpportunity(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  await db
    .delete(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.userId, user.id)));

  revalidatePath("/opportunities");
  return { success: true, id };
}
