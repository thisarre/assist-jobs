import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { companies } from "@/db/schema";

/** Load the company select options for a user, ordered by name. */
export async function loadContactFormOptions(userId: string) {
  const companyOptions = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(eq(companies.userId, userId))
    .orderBy(asc(companies.name));

  return { companyOptions };
}
