import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companies, contacts } from "@/db/schema";

/** Load the company + contact select options for a user, ordered by name. */
export async function loadOpportunityFormOptions(userId: string) {
  const companyOptions = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(eq(companies.userId, userId))
    .orderBy(asc(companies.name));

  const contactRows = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
    })
    .from(contacts)
    .where(eq(contacts.userId, userId))
    .orderBy(asc(contacts.firstName));

  const contactOptions = contactRows.map((c) => ({
    id: c.id,
    label: `${c.firstName} ${c.lastName}`,
  }));

  return { companyOptions, contactOptions };
}
