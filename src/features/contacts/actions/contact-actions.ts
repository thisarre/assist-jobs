"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db/client";
import { contacts } from "@/db/schema";
import { emptyToNull, parseDateInput } from "@/lib/forms";
import { contactSchema } from "@/features/contacts/schemas/contact";

type ActionResult =
  | { success: true; id: string }
  | { error: string | Record<string, string[] | undefined> };

export async function createContact(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const [row] = await db
    .insert(contacts)
    .values({
      userId: user.id,
      companyId: emptyToNull(v.companyId),
      firstName: v.firstName,
      lastName: v.lastName,
      role: emptyToNull(v.role),
      linkedinUrl: emptyToNull(v.linkedinUrl),
      email: emptyToNull(v.email),
      phone: emptyToNull(v.phone),
      language: v.language,
      relationshipStrength: v.relationshipStrength,
      notes: emptyToNull(v.notes),
      nextFollowupAt: parseDateInput(v.nextFollowupAt),
    })
    .returning({ id: contacts.id });

  revalidatePath("/contacts");
  return { success: true, id: row.id };
}

export async function updateContact(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  await db
    .update(contacts)
    .set({
      companyId: emptyToNull(v.companyId),
      firstName: v.firstName,
      lastName: v.lastName,
      role: emptyToNull(v.role),
      linkedinUrl: emptyToNull(v.linkedinUrl),
      email: emptyToNull(v.email),
      phone: emptyToNull(v.phone),
      language: v.language,
      relationshipStrength: v.relationshipStrength,
      notes: emptyToNull(v.notes),
      nextFollowupAt: parseDateInput(v.nextFollowupAt),
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, id), eq(contacts.userId, user.id)));

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return { success: true, id };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  await db
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.userId, user.id)));

  revalidatePath("/contacts");
  return { success: true, id };
}
