"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { opportunities } from "@/db/schema";
import { opportunityStatusSchema } from "@/features/opportunities/schemas/status";

type ActionResult = { success: true; id: string } | { error: string };

export async function updateOpportunityStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = opportunityStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  await db
    .update(opportunities)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(and(eq(opportunities.id, id), eq(opportunities.userId, user.id)));

  revalidatePath("/opportunities");
  return { success: true, id };
}
