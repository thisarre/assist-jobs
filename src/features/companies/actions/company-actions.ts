"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/client";
import { companies } from "@/db/schema";
import { emptyToNull } from "@/lib/forms";
import { companySchema } from "@/features/companies/schemas/company";

type ActionResult =
  | { success: true; id: string }
  | { error: string | Record<string, string[] | undefined> };

export async function createCompany(input: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const [row] = await db
    .insert(companies)
    .values({
      userId: user.id,
      name: v.name,
      website: emptyToNull(v.website),
      linkedinUrl: emptyToNull(v.linkedinUrl),
      industry: emptyToNull(v.industry),
      size: emptyToNull(v.size),
      location: emptyToNull(v.location),
      technologies: v.technologies,
      hiringSignals: emptyToNull(v.hiringSignals),
      notes: emptyToNull(v.notes),
      relationshipStatus: v.relationshipStatus,
      score: v.score,
    })
    .returning({ id: companies.id });

  revalidatePath("/companies");
  return { success: true, id: row.id };
}

export async function updateCompany(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  await db
    .update(companies)
    .set({
      name: v.name,
      website: emptyToNull(v.website),
      linkedinUrl: emptyToNull(v.linkedinUrl),
      industry: emptyToNull(v.industry),
      size: emptyToNull(v.size),
      location: emptyToNull(v.location),
      technologies: v.technologies,
      hiringSignals: emptyToNull(v.hiringSignals),
      notes: emptyToNull(v.notes),
      relationshipStatus: v.relationshipStatus,
      score: v.score,
      updatedAt: new Date(),
    })
    .where(and(eq(companies.id, id), eq(companies.userId, user.id)));

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  return { success: true, id };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await db
    .delete(companies)
    .where(and(eq(companies.id, id), eq(companies.userId, user.id)));

  revalidatePath("/companies");
  return { success: true, id };
}
